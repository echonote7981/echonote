import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { bannerMessageStyles } from '../styles/bannerMessage';

// In BannerMessage.tsx
interface BannerMessageProps {
    remainingMinutes: number;
    onUpgrade: () => void;
  }
  
  export default function BannerMessage({ remainingMinutes, onUpgrade }: BannerMessageProps) {
    const [showBanner, setShowBanner] = useState(true);
    
    return (
      showBanner && <View style={bannerMessageStyles.container}>
        <Text style={bannerMessageStyles.text}>
          Only {remainingMinutes} minutes{"\n"}left of your free recording time.
        </Text>
        <TouchableOpacity 
          style={bannerMessageStyles.button}
          onPress={onUpgrade}
        >
          <Text style={bannerMessageStyles.buttonText}>UPGRADE</Text>
        </TouchableOpacity>
      </View>
    );
  }
  