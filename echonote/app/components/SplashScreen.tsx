import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Controls fading effect

  useEffect(() => {
    // Fade-out effect after showing for 1 second
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000, // Controls speed of fade-out
      delay: 1000, // Wait 1 sec before fading out
      useNativeDriver: true,
    }).start(() => {
      onFinish(); // Transition to the main screen
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/logo1.webp')}
        style={[styles.fullScreenLogo, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullScreenLogo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
