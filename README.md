# Introduction

This sample app is for illustration only. It uses both Gemini and Google Maps Platform services. It is your responsibility to review the relevant Terms of Service applicable to your region, and you must confirm that your integration will comply with those terms. This sample app may show products or functionality that are not available in your region under the Terms of Service for that region.

# Setting Up Your API Keys

**IMPORTANT:** This demo uses several Google and Google Maps Platform APIs to function correctly. The API keys included in the sample code are for demonstration purposes only and are subject to restrictive quotas that may cause the application to fail. To ensure a stable experience and to explore the full capabilities of the application, you **must obtain and use your own API keys**.

### 1. Get Your Google Maps Platform API Key

Follow the instructions in the official documentation to create a new API key. You will need a Google Cloud project with billing enabled.

**[Get a Maps API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)**

In your Google Cloud project's dashboard, navigate to the "APIs & Services" section and enable the following APIs:

*   **Geocoding API**: Converts addresses into geographic coordinates.
*   **Directions API**: Calculates routes between locations.
*   **Maps JavaScript API**: Loads and displays the map.

Once you have your key, replace the placeholder key in `App.tsx`:

```typescript
// In App.tsx

<APIProvider
    version={'alpha'}
    apiKey={'YOUR_MAPS_API_KEY_HERE'} // <--- REPLACE THIS KEY
    solutionChannel={"gmp_aistudio_routeplanner_v1.0.0"}>
  <AppComponent />
</APIProvider>
```

### 2. Get Your Gemini API Key

This application uses the Gemini API to generate incident reports for your route.

1.  Get an API key from Google AI Studio: **[Get a Gemini API Key](https://aistudio.google.com/app/apikey)**
2.  In your development environment, set the `API_KEY` environment variable to your key. The application is configured to read this key automatically.

> Failure to use your own keys may result in the map failing to load or routing and incident reporting features being unavailable due to quota limits on shared demo keys.

# Application Architecture: Smart Route Planner

This document outlines the architecture of the Smart Route Planner, a web application built with React that helps users find an optimal route home, avoiding traffic and potential police-reported incidents. It leverages the Gemini API for intelligent incident reporting and Google Maps Platform for routing, traffic visualization, and geocoding, all displayed on a Photorealistic 3D Map.

## 1. Overall Structure & Core Technologies

The application is a **React-based Single Page Application (SPA)**. The architecture is modular, separating concerns into distinct components, hooks, and utility libraries.

-   **`App.tsx`**: The root component that orchestrates the entire user experience. It manages the map instance, directions services, and the core logic for calculating routes and fetching incident reports.
-   **`/components`**: Contains all the reusable React components that make up the UI.
    -   `Sidebar.tsx`: The main container for the application's UI, holding the input and results panels.
    -   `ControlTray.tsx`: The input panel where the user enters their "Home" address and initiates the route search.
    -   `StreamingConsole.tsx`: The results panel that displays turn-by-turn directions and the AI-generated incident report.
-   **`/lib`**: A collection of client-side libraries and helper functions. This includes state management configuration (Zustand) and application constants.
-   **State Management**: The app uses **Zustand** (`lib/state.ts`) to manage global state for the route, incidents, and loading status, making it easy for different components to share and react to data changes.

## 2. Key Concepts Explained

This application brings together several powerful technologies:

-   **Gemini API with Search Grounding**: The application uses the Gemini API's `generateContent` function with the `googleSearch` tool. When a user calculates a route, the app constructs a query (e.g., "police reports on I-5 North in Seattle") and sends it to Gemini. The model uses its search grounding capability to find relevant, up-to-date information from the web and generates a concise summary of potential incidents, which is then displayed to the user. This logic is primarily located in `App.tsx`.
-   **Google Maps Platform Services**:
    -   **`@vis.gl/react-google-maps`**: This library simplifies the integration of Google Maps into React. The `<APIProvider>` handles loading the Maps API, and hooks like `useMapsLibrary` and `useMap` provide safe access to the map instance and its services.
    -   **Directions Service**: This service calculates the optimal route from the user's current location to their destination. The application configures it to be traffic-aware, providing a route that accounts for current congestion.
    -   **Traffic Layer**: A visual layer is overlaid on the map to display real-time traffic conditions, color-coding roads based on traffic speed.
    -   **Geocoding**: Used to convert the user's typed "Home" address into geographic coordinates (latitude and longitude) required for routing.
    -   **Photorealistic 3D Maps**: The immersive map view is powered by the `<gmp-map-3d>` web component, providing a detailed, real-world context for the route.

## 3. Application Flow

1.  **Initialization**: The app loads and requests the user's geolocation to determine their starting point.
2.  **User Input**: The user enters their "Home" address in the input panel and clicks "Find Route Home."
3.  **Route Calculation**:
    -   The `handleFindRoute` function in `App.tsx` is triggered.
    -   The Google Maps `DirectionsService` is called with the user's current location and the "Home" address. The request specifies that the route should be optimized for current traffic conditions.
4.  **Map Visualization**:
    -   The returned route is drawn on the 3D map using a `DirectionsRenderer`.
    -   The `TrafficLayer` is activated, showing color-coded traffic congestion.
    -   The map camera automatically zooms and pans to frame the entire route.
5.  **AI Incident Reporting**:
    -   A query is dynamically generated based on the calculated route.
    -   A call is made to the Gemini API with this query, using the `googleSearch` tool.
    -   Gemini returns a text summary of any found incidents (e.g., accidents, police activity).
6.  **Display Results**:
    -   The turn-by-turn directions and the AI-generated incident report are displayed in the results panel for the user to review.
