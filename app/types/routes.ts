import React from 'react';

// Define the navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '/(tabs)': undefined;
      '/(tabs)/index': undefined;
      '/(tabs)/meetings': undefined;
      '/(tabs)/actions': undefined;
      '/(tabs)/archived': undefined;
      '/meeting/[id]': { id: string };
    }
  }
}

// Export the type for use in the app
export type RootStackParamList = {
  '/(tabs)': undefined;
  '/(tabs)/index': undefined;
  '/(tabs)/meetings': undefined;
  '/(tabs)/actions': undefined;
  '/(tabs)/archived': undefined;
  '/meeting/[id]': { id: string };
}

// This dummy component satisfies Expo Router's requirement for a default export
// In Expo Router, all files need to export a React component as the default
export default function RouteTypes() {
  // This component is never actually rendered, it just exists to satisfy Expo Router
  return null;
}
