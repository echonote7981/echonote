import React, { useEffect } from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform, StatusBar as RNStatusBar, View, StyleSheet, StatusBarStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

/**
 * GlobalStatusBar component to ensure consistent status bar appearance
 * across the entire application with a colored background and white text/icons
 */
export const GlobalStatusBar = () => {
  const { t } = useTranslation();
  
  // Set status bar configuration immediately on component mount
  useEffect(() => {
    // Force the status bar to be visible and use light content (white text)
    if (Platform.OS === 'ios') {
      RNStatusBar.setBarStyle('light-content', true);
    } else if (Platform.OS === 'android') {
      // For Android, set background color, make it non-translucent, and set white text
      RNStatusBar.setBackgroundColor('#000000');
      RNStatusBar.setTranslucent(false);
      RNStatusBar.setBarStyle('light-content');
    }

    // This helps force status bar visibility on some devices
    setTimeout(() => {
      if (Platform.OS === 'ios') {
        RNStatusBar.setHidden(false);
        RNStatusBar.setBarStyle('light-content', true);
      }
    }, 100);
  }, []);

  return (
    <>
      {/* Make sure there's space for the status bar on iOS */}
      {Platform.OS === 'ios' && (
        <View style={styles.statusBarBackground} />
      )}
      {/* Set Expo status bar to light (white text) with proper hiding behavior */}
      <ExpoStatusBar style="light" hideTransitionAnimation="fade" animated={true} />
      
      {/* Force a native status bar update */}
      <RNStatusBar 
        barStyle="light-content" 
        backgroundColor="#000000"
        animated={true}
        showHideTransition="fade"
      />
    </>
  );
};

const styles = StyleSheet.create({
  statusBarBackground: {
    height: Platform.OS === 'ios' ? Constants.statusBarHeight || 44 : RNStatusBar.currentHeight || 0,
    backgroundColor: '#000000', // Black background (matches Android)
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999, // Higher z-index to ensure it's above everything else
  }
});

export default GlobalStatusBar;
