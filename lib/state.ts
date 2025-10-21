/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { Map3DCameraProps } from '@/components/map-3d';

/**
 * Settings
 */
export const useSettings = create<{
  model: string;
  setModel: (model: string) => void;
}>(set => ({
  model: 'gemini-2.5-flash',
  setModel: model => set({ model }),
}));


/**
 * Route Info
 */
export interface RouteInfo {
  directions: google.maps.DirectionsResult | null;
  incidents: string | null;
  loading: boolean;
}

export const useRouteStore = create<RouteInfo & { 
  setRouteInfo: (info: Partial<RouteInfo>) => void;
  clearRoute: () => void;
}>((set) => ({
  directions: null,
  incidents: null,
  loading: false,
  setRouteInfo: (info) => set((state) => ({ ...state, ...info })),
  clearRoute: () => set({ directions: null, incidents: null, loading: false }),
}));


/**
 * Location
 */
export const useLocationStore = create<{
  origin: google.maps.LatLng | null;
  locationError: string | null;
  setOrigin: (origin: google.maps.LatLng | null) => void;
  setLocationError: (error: string | null) => void;
}>((set) => ({
  origin: null,
  locationError: null,
  setOrigin: (origin) => set({ origin, locationError: null }), // Clear error on success
  setLocationError: (error) => set({ locationError: error, origin: null }), // Clear origin on error
}));


/**
 * Map Entities
 */
export interface MapMarker {
  position: {
    lat: number;
    lng: number;
    altitude: number;
  };
  label: string;
  showLabel: boolean;
}

export const useMapStore = create<{
  markers: MapMarker[];
  cameraTarget: Map3DCameraProps | null;
  preventAutoFrame: boolean;
  setMarkers: (markers: MapMarker[]) => void;
  clearMarkers: () => void;
  setCameraTarget: (target: Map3DCameraProps | null) => void;
  setPreventAutoFrame: (prevent: boolean) => void;
}>(set => ({
  markers: [],
  cameraTarget: null,
  preventAutoFrame: false,
  setMarkers: markers => set({ markers }),
  clearMarkers: () => set({ markers: [] }),
  setCameraTarget: target => set({ cameraTarget: target }),
  setPreventAutoFrame: prevent => set({ preventAutoFrame: prevent }),
}));