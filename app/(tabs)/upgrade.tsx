import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles';

export default function UpgradeScreen() {
  const router = useRouter();
  const { setIsPremium } = useUser();

  const handleUpgrade = () => {
    setIsPremium(true);
    router.back();
  };

  const handleRestore = () => {
    // Implement restore purchases functionality here
    console.log('Restore purchases');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EchoNote Premium</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Go Premium Plus!</Text>
        
        <View style={styles.featuresList}>
          {/* Feature 1 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="description" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>Advanced Export (PDF, DOCX, SRT)</Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="spellcheck" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>100 Custom Vocabulary</Text>
              <Text style={styles.featureSubtext}>for improving accuracy</Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="speed" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>More playback speeds & skip silence</Text>
            </View>
          </View>

          {/* Feature 4 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="cloud-upload" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>10 imports per month while using minutes</Text>
            </View>
          </View>

          {/* Feature 5 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="timer" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>1,200 minutes of transcription</Text>
              <Text style={styles.featureSubtext}>per month, and more!</Text>
            </View>
          </View>
        </View>

        {/* Pricing options */}
        <TouchableOpacity style={styles.pricingButton} onPress={handleUpgrade}>
          <Text style={styles.pricingButtonText}>$12.99 billed monthly</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.pricingButton, styles.annualButton]} onPress={handleUpgrade}>
          <Text style={styles.pricingButtonText}>$89.99 billed annually</Text>
          <Text style={styles.savingsText}>(SAVE $65.89)</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Subscriptions will be charged via your iTunes account.
          </Text>
          <Text style={styles.footerText}>
            Any unused portion of a Free Trial, if offered, is forfeited when you buy a subscription.
          </Text>
          <Text style={styles.footerText}>
            Your subscription will automatically renew unless it is canceled at least 24 hours before the end of the current period.
          </Text>
          <Text style={styles.footerText}>
            You can manage your subscriptions in Settings.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  title: {
    color: '#007AFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  featuresList: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  featureSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  pricingButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  annualButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  pricingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingsText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 4,
  },
  restoreText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  footerContainer: {
    marginTop: 16,
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
});
