import { useEffect, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { Product, SubscriptionPurchase, PurchaseError } from 'react-native-iap';
import { useUser } from '../../context/UserContext';
import {
  initializePurchases,
  getSubscriptionProducts,
  purchaseSubscription,
  checkSubscriptionStatus,
  SUBSCRIPTION_SKUS
} from './purchaseService';
import { useTranslation } from 'react-i18next'

export interface PurchaseHookResult {
  products: Product[];
  isPurchasing: boolean;
  isLoading: boolean;
  error: string | null;
  purchaseMonthlySubscription: () => Promise<void>;
  purchaseYearlySubscription: () => Promise<void>;
  refreshPurchases: () => Promise<void>;
}

// This default export prevents the "missing default export" warning from Expo Router
// Since this is a utility file, not a route component
export default function PurchasesHookPage() {
  return null;
}

export const usePurchases = (): PurchaseHookResult => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { setIsPremium, setHasAcceptedTerms, setHasAcceptedPrivacyPolicy } = useUser();

  // Initialize IAP and fetch products
  useEffect(() => {
    const setup = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize IAP connection
        const isInitialized = await initializePurchases();
        if (!isInitialized) {
          throw new Error('Failed to initialize in-app purchases');
        }
        
        // Get available subscription products
        const availableProducts = await getSubscriptionProducts();
        setProducts(availableProducts);
        
        // Check if user already has an active subscription
        const hasSubscription = await checkSubscriptionStatus();
        setIsPremium(hasSubscription);
        
      } catch (err: any) {
        console.error('Purchase setup error:', err);
        setError(err.message || 'Failed to set up purchases');
      } finally {
        setIsLoading(false);
      }
    };
    
    setup();
    
    // Cleanup function
    return () => {
      // Any cleanup needed for IAP listeners would go here
    };
  }, [setIsPremium]);

  // Helper to find product by ID
  const findProductById = useCallback((productId: string): Product | undefined => {
    return products.find(product => product.productId === productId);
  }, [products]);

  // Purchase monthly subscription
  const purchaseMonthlySubscription = useCallback(async () => {
    try {
      setIsPurchasing(true);
      setError(null);
      
      const monthlyId = Platform.select({
        ios: 'com.echonotes.monthly',
        android: 'com.echonotes.monthly',
        default: ''
      });
      
      if (!monthlyId) {
        throw new Error('Monthly subscription not available on this platform');
      }
      
      const product = findProductById(monthlyId);
      if (!product) {
        throw new Error('Monthly subscription product not found');
      }
      
      await purchaseSubscription(
        monthlyId,
        undefined,
        (purchase: SubscriptionPurchase) => {
          console.log('Monthly subscription purchased successfully:', purchase);
          setIsPremium(true);
          setHasAcceptedTerms(true);
          setHasAcceptedPrivacyPolicy(true);
          
          // Save user preferences to backend
          saveUserPreferences({
            isPremium: true,
            hasAcceptedTerms: true,
            hasAcceptedPrivacyPolicy: true
          });
          
          Alert.alert(
            'Subscription Successful',
            'You now have access to all premium features!'
          );
        },
        (error: PurchaseError) => {
          console.error('Purchase error:', error);
          setError(error.message || 'Failed to purchase subscription');
          
          if (error.name !== 'E_USER_CANCELLED') {     Alert.alert(
              'Purchase Failed',
              'There was an error processing your purchase. Please try again later.'
            );
          }
        }
      );
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to purchase subscription');
      
      Alert.alert(
        'Purchase Failed',
        'There was an error processing your purchase. Please try again later.'
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [findProductById, setIsPremium, setHasAcceptedTerms, setHasAcceptedPrivacyPolicy]);

  // Purchase yearly subscription
  const purchaseYearlySubscription = useCallback(async () => {
    try {
      setIsPurchasing(true);
      setError(null);
      
      const yearlyId = Platform.select({
        ios: 'com.echonotes.yearly',
        android: 'com.echonotes.yearly',
        default: ''
      });
      
      if (!yearlyId) {
        throw new Error('Yearly subscription not available on this platform');
      }
      
      const product = findProductById(yearlyId);
      if (!product) {
        throw new Error('Yearly subscription product not found');
      }
      
      await purchaseSubscription(
        yearlyId,
        undefined,
        (purchase: SubscriptionPurchase) => {
          console.log('Yearly subscription purchased successfully:', purchase);
          setIsPremium(true);
          setHasAcceptedTerms(true);
          setHasAcceptedPrivacyPolicy(true);
          
          // Save user preferences to backend
          saveUserPreferences({
            isPremium: true,
            hasAcceptedTerms: true,
            hasAcceptedPrivacyPolicy: true
          });
          
          Alert.alert(
            'Subscription Successful',
            'You now have access to all premium features!'
          );
        },
        (error: PurchaseError) => {
          console.error('Purchase error:', error);
          setError(error.message || 'Failed to purchase subscription');
          
          if (error.name !== 'E_USER_CANCELLED') {     Alert.alert(
              'Purchase Failed',
              'There was an error processing your purchase. Please try again later.'
            );
          }
        }
      );
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to purchase subscription');
      
      Alert.alert(
        'Purchase Failed',
        'There was an error processing your purchase. Please try again later.'
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [findProductById, setIsPremium, setHasAcceptedTerms, setHasAcceptedPrivacyPolicy]);

  // Refresh purchases
  const refreshPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user has an active subscription
      const hasSubscription = await checkSubscriptionStatus();
      setIsPremium(hasSubscription);
      
      // Refresh product list
      const availableProducts = await getSubscriptionProducts();
      setProducts(availableProducts);
    } catch (err: any) {
      console.error('Refresh purchases error:', err);
      setError(err.message || 'Failed to refresh purchases');
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium]);

  // Helper function to save user preferences to backend
  const saveUserPreferences = async (preferences: {
    isPremium?: boolean;
    hasAcceptedTerms?: boolean;
    hasAcceptedPrivacyPolicy?: boolean;
  }) => {
    try {
      // Get user email (in a real app, this would come from authentication)
      const userEmail = 'user@example.com'; // Replace with actual user email
      
      const response = await fetch('/api/users/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          ...preferences
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user preferences');
      }
      
      console.log('User preferences saved successfully');
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  return {
    products,
    isPurchasing,
    isLoading,
    error,
    purchaseMonthlySubscription,
    purchaseYearlySubscription,
    refreshPurchases
  };
};
