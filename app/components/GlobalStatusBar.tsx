import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform, StatusBar as RNStatusBar, View, StyleSheet } from 'react-native';

/**
 * GlobalStatusBar component to ensure consistent status bar appearance
 * across the entire application with a colored background and white text/icons
 */
export const GlobalStatusBar = () => {
  // Set status bar background color and text color
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      // For Android, set background color and make it non-translucent
      RNStatusBar.setBackgroundColor('#000000'); // Black background
      RNStatusBar.setTranslucent(false);         // Non-transparent
      RNStatusBar.setBarStyle('light-content');  // White text
    }
  }, []);

  return (
    <>
      {/* For iOS, create a colored status bar background */}
      {Platform.OS === 'ios' && (
        <View style={styles.statusBarBackground} />
      )}
      {/* Set status bar style to light (white text) */}
      <ExpoStatusBar style="light" />
    </>
  );
};

const styles = StyleSheet.create({
  statusBarBackground: {
    height: RNStatusBar.currentHeight || 44,
    backgroundColor: '#000000', // Black background (matches Android)
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  }
});

export default GlobalStatusBar;
