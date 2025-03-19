import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import globalStyles from '../styles/globalStyles';

export default function UpgradeScreen() {
  const router = useRouter();
  const { setIsPremium } = useUser();

  const handleUpgrade = () => {
    setIsPremium(true);
    router.back();
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Upgrade to Premium</Text>
      <Text style={globalStyles.description}>
        Unlock all features with our premium subscription
      </Text>

      <View style={globalStyles.features}>
        <Text style={globalStyles.feature}>• Unlimited recordings</Text>
        <Text style={globalStyles.feature}>• Advanced analytics</Text>
        <Text style={globalStyles.feature}>• Priority support</Text>
      </View>

      <TouchableOpacity 
        style={globalStyles.upgradeButton}
        onPress={handleUpgrade}
      >
        <Text style={globalStyles.upgradeButtonText}>Upgrade Now</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={globalStyles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={globalStyles.cancelButtonText}>Maybe Later</Text>
      </TouchableOpacity>
    </View>
  );
}
