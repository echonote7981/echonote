import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles';
import TermsModal from '../components/TermsModal';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import { usePurchases } from '../services/purchases/usePurchases';
import { useTranslation } from 'react-i18next';

export default function UpgradeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setIsPremium, hasAcceptedTerms, setHasAcceptedTerms, hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy } = useUser();
  
  // Use our purchases hook
  const { 
    products, 
    isPurchasing, 
    isLoading, 
    error, 
    purchaseMonthlySubscription, 
    purchaseYearlySubscription, 
    refreshPurchases 
  } = usePurchases();
  
  // State for modals
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [acceptedBothPolicies, setAcceptedBothPolicies] = useState(hasAcceptedTerms && hasAcceptedPrivacyPolicy);
  
  // State for subscription prices
  const [monthlyPrice, setMonthlyPrice] = useState('$12.99');
  const [yearlyPrice, setYearlyPrice] = useState('$89.99');
  const [yearSavings, setYearSavings] = useState('$65.89');

  // Update acceptedBothPolicies when either policy acceptance changes
  useEffect(() => {
    setAcceptedBothPolicies(hasAcceptedTerms && hasAcceptedPrivacyPolicy);
  }, [hasAcceptedTerms, hasAcceptedPrivacyPolicy]);
  
  // Update prices from IAP products when they load
  useEffect(() => {
    if (products && products.length > 0) {
      // Find monthly and yearly subscription products
      const monthlyProduct = products.find(p => 
        p.productId === (Platform.OS === 'ios' ? 'com.echonotes.monthly' : 'com.echonotes.monthly'));
      
      const yearlyProduct = products.find(p => 
        p.productId === (Platform.OS === 'ios' ? 'com.echonotes.yearly' : 'com.echonotes.yearly'));
      
      // Update prices if products are found
      if (monthlyProduct) {
        setMonthlyPrice(monthlyProduct.localizedPrice || '$12.99');
      }
      
      if (yearlyProduct) {
        setYearlyPrice(yearlyProduct.localizedPrice || '$89.99');
        
        // Calculate savings
        if (monthlyProduct && yearlyProduct) {
          const monthlyCost = parseFloat(monthlyProduct.price) * 12;
          const yearlyCost = parseFloat(yearlyProduct.price);
          const savings = monthlyCost - yearlyCost;
          
          if (!isNaN(savings) && savings > 0) {
            setYearSavings(`$${savings.toFixed(2)}`);
          }
        }
      }
    }
  }, [products]);

  const handleMonthlyUpgrade = async () => {
    if (!acceptedBothPolicies) {
      Alert.alert(
        "Terms & Privacy Policy",
        "You must accept both the Terms & Conditions and Privacy Policy to continue.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    try {
      await purchaseMonthlySubscription();
    } catch (error) {
      console.error('Error during monthly subscription purchase:', error);
    }
  };
  
  const handleYearlyUpgrade = async () => {
    if (!acceptedBothPolicies) {
      Alert.alert(
        "Terms & Privacy Policy",
        "You must accept both the Terms & Conditions and Privacy Policy to continue.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    try {
      await purchaseYearlySubscription();
    } catch (error) {
      console.error('Error during yearly subscription purchase:', error);
    }
  };

  const handleRestore = async () => {
    try {
      await refreshPurchases();
      Alert.alert(
        "Purchases Restored",
        "Your purchases have been restored.",
        [{ text: "OK", style: "default" }]
      );
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert(
        "Restore Failed",
        "Failed to restore purchases. Please try again later.",
        [{ text: "OK", style: "default" }]
      );
    }
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading subscription options...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.pricingButton, isPurchasing && styles.disabledButton]} 
              onPress={handleMonthlyUpgrade}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.pricingButtonText}>{monthlyPrice} billed monthly</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.pricingButton, styles.annualButton, isPurchasing && styles.disabledButton]} 
              onPress={handleYearlyUpgrade}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.pricingButtonText}>{yearlyPrice} billed annually</Text>
                  <Text style={styles.savingsText}>(SAVE {yearSavings})</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>

        {/* Terms and Privacy Policy Section */}
        <View style={styles.termsContainer}>
          <View style={styles.termsRow}>
            <Text style={styles.termsText}>
              I accept the {' '}
              <Text style={styles.termsLink} onPress={() => setTermsModalVisible(true)}>
                Terms & Conditions
              </Text>
              {' '}and{' '}
              <Text style={styles.termsLink} onPress={() => setPrivacyModalVisible(true)}>
                Privacy Policy
              </Text>
            </Text>
            <Switch
              value={acceptedBothPolicies}
              onValueChange={(value) => {
                if (value) {
                  setTermsModalVisible(true);
                } else {
                  setHasAcceptedTerms(false);
                  setHasAcceptedPrivacyPolicy(false);
                }
              }}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={acceptedBothPolicies ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

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

      {/* Terms Modal */}
      <TermsModal 
        visible={termsModalVisible} 
        onClose={() => setTermsModalVisible(false)}
        onAccept={() => {
          setHasAcceptedTerms(true);
          // If privacy policy is already accepted, close this modal
          // Otherwise, show privacy policy modal next
          if (hasAcceptedPrivacyPolicy) {
            setTermsModalVisible(false);
          } else {
            setTermsModalVisible(false);
            setPrivacyModalVisible(true);
          }
        }}
        showAcceptButton={true}
      />
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        visible={privacyModalVisible} 
        onClose={() => setPrivacyModalVisible(false)}
        onAccept={() => {
          setHasAcceptedPrivacyPolicy(true);
          setPrivacyModalVisible(false);
        }}
        showAcceptButton={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  disabledButton: {
    opacity: 0.7,
  },
  termsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  termsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  termsText: {
    color: '#8E8E93',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  termsLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
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
