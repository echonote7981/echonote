import * as Localization from 'expo-localization';
// import { View } from 'react-native';
// import React from 'react';

export const getSafeLocale = () => {
  try {
    return Localization.locale || 'en-US';
  } catch (error) {
    console.warn('Failed to get locale:', error);
    return 'en-US';
  }
};

export const isRTL = () => {
  try {
    return Localization.isRTL;
  } catch {
    return false;
  }
};

// This default export prevents the "missing default export" warning from Expo Router
// Since this is a utility file, not a route component
export default function LocaleUtilsPage() {
  return null; // Return null instead of JSX in a .ts file
}
