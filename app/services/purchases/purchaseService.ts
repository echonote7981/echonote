import { Platform } from 'react-native';
import {
  initConnection,
  getProducts,
  requestSubscription,
  purchaseErrorListener,
  purchaseUpdatedListener,
  finishTransaction,
  getAvailablePurchases,
  ProductPurchase,
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
  Product
} from 'react-native-iap';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';

// Check if we're in development mode
const isDevelopmentMode = __DEV__;

// This default export prevents the "missing default export" warning from Expo Router
// Since this is a utility file, not a route component
export default function PurchaseServicePage() {
  const { t } = useTranslation();
  return null;
}

// Mock products for development mode
const mockProducts = [
  {
    productId: 'com.echonotes.monthly',
    title: 'EchoNotes Monthly Subscription',
    description: 'Access to all premium features with a monthly subscription',
    price: '12.99',
    localizedPrice: '$12.99',
    currency: 'USD',
  },
  {
    productId: 'com.echonotes.yearly',
    title: 'EchoNotes Yearly Subscription',
    description: 'Access to all premium features with a yearly subscription',
    price: '89.99',
    localizedPrice: '$89.99',
    currency: 'USD',
  }
];

// Product IDs for subscriptions
export const SUBSCRIPTION_SKUS = Platform.select({
  ios: [
    'com.echonotes.monthly', // Monthly subscription
    'com.echonotes.yearly'   // Annual subscription
  ],
  android: [
    'com.echonotes.monthly', // Monthly subscription
    'com.echonotes.yearly'   // Annual subscription
  ],
  default: []
});

// Initialize the IAP connection
export const initializePurchases = async (): Promise<boolean> => {
  try {
    // If in development mode, skip actual IAP initialization
    if (isDevelopmentMode) {
      console.log('Running in development mode - using mock IAP implementation');
      return true;
    }
    
    const isConnected = await initConnection();
    console.log('IAP connection established:', isConnected);
    return true;
  } catch (error) {
    console.error('Failed to establish IAP connection:', error);
    
    // In development, we'll still return true to allow testing the UI
    if (isDevelopmentMode) {
      console.log('Using mock IAP implementation instead');
      return true;
    }
    
    return false;
  }
};

// Get available subscription products
export const getSubscriptionProducts = async (): Promise<Product[]> => {
  try {
    // If in development mode, return mock products
    if (isDevelopmentMode) {
      console.log('Returning mock subscription products');
      return mockProducts as unknown as Product[];
    }
    
    if (!SUBSCRIPTION_SKUS || SUBSCRIPTION_SKUS.length === 0) {
      return [];
    }
    
    const products = await getProducts({ skus: SUBSCRIPTION_SKUS });
    return products;
  } catch (error) {
    console.error('Failed to get subscription products:', error);
    
    // In development, return mock products even on error
    if (isDevelopmentMode) {
      console.log('Returning mock subscription products after error');
      return mockProducts as unknown as Product[];
    }
    
    return [];
  }
};

// Purchase a subscription
export const purchaseSubscription = async (
  sku: string, 
  offerToken?: string,
  onSuccess?: (purchase: SubscriptionPurchase) => void,
  onError?: (error: PurchaseError) => void
) => {
  try {
    // In development mode, simulate a successful purchase
    if (isDevelopmentMode) {
      console.log('Development mode: Simulating successful purchase for', sku);
      
      // Create a mock purchase object
      const mockPurchase = {
        productId: sku,
        transactionId: 'mock-transaction-' + Date.now(),
        transactionDate: new Date().toISOString(),
        transactionReceipt: 'mock-receipt-data',
        purchaseToken: 'mock-purchase-token',
        dataAndroid: {},
        signatureAndroid: 'mock-signature',
        isAcknowledgedAndroid: true
      } as unknown as SubscriptionPurchase;
      
      // Simulate network delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(mockPurchase);
        }
      }, 1500);
      
      return true;
    }
    
    // Request the subscription
    let purchaseOptions: { sku: string; subscriptionOffers?: Array<{ sku: string; offerToken: string }> } = { sku };
    
    // Add offer token for Android promotional offers
    if (Platform.OS === 'android' && offerToken) {
      purchaseOptions.subscriptionOffers = [{ sku, offerToken }];
    }
    
    // Setup listeners for purchase events
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      
      if (receipt) {
        try {
          // Validate receipt with backend
          const validationResult = await validateReceipt(purchase);
          
          // Finish the transaction
          await finishTransaction({ purchase, isConsumable: false });
          
          // Call success callback
          if (onSuccess) {
            onSuccess(purchase as SubscriptionPurchase);
          }
        } catch (error) {
          console.error('Error validating receipt:', error);
          if (onError) {
            onError({
              name: 'E_RECEIPT_VALIDATION_FAILED',
              message: 'Failed to validate receipt',
              responseCode: -1
            });
          }
        }
      }
      
      // Remove the listener
      purchaseUpdateSubscription.remove();
    });
    
    // Setup error listener
    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.error('Purchase error:', error);
      if (onError) {
        onError(error);
      }
      purchaseErrorSubscription.remove();
    });
    
    // Request the subscription
    await requestSubscription(purchaseOptions);
    
    return true;
  } catch (error) {
    console.error('Failed to purchase subscription:', error);
    
    // In development mode, we can simulate success even on error
    if (isDevelopmentMode) {
      console.log('Development mode: Simulating successful purchase despite error');
      
      // Create a mock purchase object
      const mockPurchase = {
        productId: sku,
        transactionId: 'mock-transaction-' + Date.now(),
        transactionDate: new Date().toISOString(),
        transactionReceipt: 'mock-receipt-data',
        purchaseToken: 'mock-purchase-token',
        dataAndroid: {},
        signatureAndroid: 'mock-signature',
        isAcknowledgedAndroid: true
      } as unknown as SubscriptionPurchase;
      
      // Simulate network delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(mockPurchase);
        }
      }, 1500);
      
      return true;
    }
    
    if (onError) {
      onError({
        name: 'E_UNKNOWN',
        message: 'Unknown error occurred',
        responseCode: -1
      });
    }
    return false;
  }
};

// Validate receipt with backend
const validateReceipt = async (purchase: ProductPurchase): Promise<boolean> => {
  try {
    // Extract receipt data based on platform
    const receiptData = Platform.OS === 'ios' 
      ? { receipt: purchase.transactionReceipt } 
      : { 
          packageName: 'com.echonotes', 
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken 
        };
    
    // In a real app, you would send this to your backend for validation
    // For now, we'll simulate a successful validation
    console.log('Receipt data to validate:', receiptData);
    
    // Simulate backend validation
    // In a real app, you would use a real API endpoint
    // const response = await fetch('/api/validate-receipt', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(receiptData),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Receipt validation failed');
    // }
    // 
    // const result = await response.json();
    // return result.isValid;
    
    // For demo purposes, just return true
    return true;
  } catch (error) {
    console.error('Receipt validation error:', error);
    return false;
  }
};

// Get active subscriptions
export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const purchases = await getAvailablePurchases();
    // Filter active purchases and convert to Subscription type
    const activePurchases = purchases.filter(purchase => {
      if (Platform.OS === 'ios') {
        // On iOS, check if the subscription is still valid based on transaction date
        const purchaseData = purchase as ProductPurchase;
        // Check if transaction exists and is recent (within last year as a basic check)
        const transactionDate = purchaseData.transactionDate 
          ? new Date(purchaseData.transactionDate).getTime() 
          : 0;
        const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
        return transactionDate > oneYearAgo;
      } else {
        // On Android, assume purchase is valid if it has a transaction receipt
        return !!purchase.transactionReceipt;
      }
    });
    
    // Cast to Subscription[] through unknown to satisfy TypeScript
    return activePurchases as unknown as Subscription[];
  } catch (error) {
    console.error('Failed to get active subscriptions:', error);
    return [];
  }
};

// Check if user has active subscription
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    // In development mode, we can simulate no active subscription initially
    if (isDevelopmentMode) {
      console.log('Development mode: Simulating no active subscription');
      return false;
    }
    
    const subscriptions = await getActiveSubscriptions();
    return subscriptions.length > 0;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
};

// Update user premium status based on subscription
export const updateUserPremiumStatus = async (): Promise<boolean> => {
  try {
    const hasActiveSubscription = await checkSubscriptionStatus();
    
    // Update user context with premium status
    // This would typically be handled by your user context
    // For example: setIsPremium(hasActiveSubscription);
    
    return hasActiveSubscription;
  } catch (error) {
    console.error('Failed to update user premium status:', error);
    return false;
  }
};
