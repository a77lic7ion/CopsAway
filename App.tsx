/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState, useEffect, useCallback } from 'react';

import ErrorScreen from './components/ErrorScreen';
import PopUp from './components/popup/PopUp';
import Sidebar from './components/Sidebar';
import { APIProvider, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Map3D } from './components/map-3d';
import { AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { useLocationStore, useRouteStore, useSettings, useMapStore } from './lib/state';
import { GoogleGenAI } from '@google/genai';
import { INCIDENT_SEARCH_PROMPT } from './lib/constants';

// This is the Gemini API key, sourced from environment variables.
const GEMINI_API_KEY = process.env.API_KEY as string;
if (typeof GEMINI_API_KEY !== 'string') {
  console.error(
    'Missing required environment variable: API_KEY for Gemini'
  );
}

const INITIAL_VIEW_PROPS = {
  center: {
    lat: 40.7128,
    lng: -74.0060,
    altitude: 1000
  },
  range: 15000,
  heading: 0,
  tilt: 45,
  roll: 0
};

/**
 * The main application component. It serves as the primary view controller,
 * orchestrating the map, route calculation, and AI incident reporting.
 */
function AppComponent() {
  const map = useMap();
  const { model } = useSettings();
  const { setRouteInfo, clearRoute } = useRouteStore();
  const { origin, setOrigin, setLocationError } = useLocationStore();
  const { markers, setMarkers } = useMapStore();
  const [showPopUp, setShowPopUp] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  const coreLibrary = useMapsLibrary('core');
  const routesLibrary = useMapsLibrary('routes');
  const geocodingLibrary = useMapsLibrary('geocoding');
  const markerLibrary = useMapsLibrary('marker');

  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect to initialize map services once the libraries are loaded.
  useEffect(() => {
    if (!map || !routesLibrary || !geocodingLibrary || !markerLibrary) return;
    
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    setTrafficLayer(new google.maps.TrafficLayer());
    setGeocoder(new geocodingLibrary.Geocoder());
  }, [map, routesLibrary, geocodingLibrary, markerLibrary]);
  
  // Effect to get the user's current location on startup.
  useEffect(() => {
    if (!coreLibrary) return;

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin(new coreLibrary.LatLng(position.coords.latitude, position.coords.longitude));
      },
      () => {
        setLocationError('Location permission denied.');
      }
    );
  }, [coreLibrary, setOrigin, setLocationError]);

  const handleFindRoute = useCallback(async (destination: string) => {
    if (!origin) {
      setError("Cannot find route without a starting location. Please enable location services.");
      return;
    }
    if (!destination.trim() || !directionsService || !directionsRenderer || !trafficLayer || !map || !routesLibrary || !geocoder) {
      setError("Missing required information to find a route.");
      return;
    }
    
    clearRoute();
    setRouteInfo({ loading: true });
    setError(null);
    
    let request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      travelMode: routesLibrary.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: routesLibrary.TrafficModel.BEST_GUESS,
      },
    };
    
    try {
      const result = await directionsService.route(request);

      // Now, call Gemini to find incidents
      const routeSummary = result.routes[0].summary || `from my current location to ${destination}`;
      const query = `Police reports and traffic incidents on the route ${routeSummary}`;
      
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const genAIResponse = await ai.models.generateContent({
        model,
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: INCIDENT_SEARCH_PROMPT,
        },
      });

      let incidents: {description: string, location: string}[] = [];
      const incidentsText = genAIResponse.text;

      if (incidentsText) {
        try {
          const cleanedIncidentsText = incidentsText.replace(/```json\n?|\n?```/g, '');
          incidents = JSON.parse(cleanedIncidentsText);
        } catch (e) {
          console.error('Error parsing incidents from Gemini:', e);
          // Fallback to showing raw text if parsing fails
          setRouteInfo({ incidents: incidentsText });
        }
      }

      if (incidents && incidents.length > 0) {
        const geocodedIncidents = await Promise.all(
          incidents.map(async (incident) => {
            try {
              const geocodeResult = await geocoder.geocode({ address: incident.location });
              if (geocodeResult.results[0]) {
                return {
                  ...incident,
                  geocodedLocation: geocodeResult.results[0].geometry.location,
                };
              }
            } catch (e) {
              console.error('Geocoding error:', e);
            }
            return null;
          })
        );

        const validIncidents = geocodedIncidents.filter(Boolean);

        if (validIncidents.length > 0) {
          request = {
            ...request,
            drivingOptions: {
              ...request.drivingOptions,
              // @ts-ignore - avoid property is not in the type definition
              avoid: validIncidents.map(incident => incident.geocodedLocation),
            },
          };
        }

        const resultWithAvoidance = await directionsService.route(request);
        directionsRenderer.setDirections(resultWithAvoidance);
        trafficLayer.setMap(map);
        map.fitBounds(resultWithAvoidance.routes[0].bounds);

        setRouteInfo({ directions: resultWithAvoidance, incidents: incidentsText });

        const markers = validIncidents.map(incident => ({
          position: { lat: incident.geocodedLocation.lat(), lng: incident.geocodedLocation.lng(), altitude: 100 },
          label: incident.description,
          showLabel: true,
        }));

        setMarkers(markers);
      } else {
        // No incidents, show original route
        directionsRenderer.setDirections(result);
        trafficLayer.setMap(map);
        map.fitBounds(result.routes[0].bounds);
        setRouteInfo({ directions: result, incidents: incidentsText });
      }

    } catch (e: any) {
      console.error('Error finding route:', e);
      let errorMessage = 'Could not find a route to that destination.';
      if (e.code === 'ZERO_RESULTS') {
        errorMessage = `No routes could be found for the address: "${destination}". Please check the address and try again.`;
      }
      setError(errorMessage);
      clearRoute();
    } finally {
      setRouteInfo({ loading: false });
    }

  }, [origin, directionsService, directionsRenderer, trafficLayer, map, model, setRouteInfo, clearRoute, routesLibrary, setError, geocoder, setMarkers]);

  return (
    <>
      <ErrorScreen customError={error} clearError={() => setError(null)} />
      {showPopUp && <PopUp onClose={() => setShowPopUp(false)} />}
      <div className="main-container">
        <Sidebar onFindRoute={handleFindRoute} />
        <div className="map-panel">
          <Map3D {...INITIAL_VIEW_PROPS}>
            {markers.map((marker, index) => (
              <AdvancedMarker
                key={index}
                position={marker.position}
                onClick={() => setSelectedMarker(marker.label)}
              >
                <Pin
                  background={'#FBBC04'}
                  borderColor={'#1e8e3e'}
                  glyphColor={'#1e8e3e'}
                />
              </AdvancedMarker>
            ))}
            {selectedMarker && (
              <InfoWindow
                position={markers.find(marker => marker.label === selectedMarker)?.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <p>{selectedMarker}</p>
              </InfoWindow>
            )}
          </Map3D>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="App">
      {/* IMPORTANT: Replace with your own Google Maps API Key */}
      <APIProvider
        version={'alpha'}
        apiKey={'AIzaSyCYTvt7YMcKjSNTnBa42djlndCeDvZHkr0'}
        solutionChannel={"gmp_aistudio_routeplanner_v1.0.0"}>
        <AppComponent />
      </APIProvider>
    </div>
  );
}

export default App;