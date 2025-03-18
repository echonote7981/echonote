import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as InAppPurchases from 'react-native-iap';
import globalStyles from '../styles/globalStyles';

// Define Product interface to match react-native-iap structure
interface Product {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  [key: string]: any; // Allow for additional properties
}

// Subscription IDs (replace with real product IDs from App Store / Google Play)
const productIds = ['premium_monthly', 'premium_annual'];

export default function UpgradeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Initialize the connection first
        await InAppPurchases.initConnection();
        // Get products with the correct parameter structure
        const items = await InAppPurchases.getProducts({ skus: productIds });
        setProducts(items);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    fetchProducts();
  }, []);

  const purchaseProduct = async (productId: string) => {
    try {
      // Request purchase with the correct parameter structure
      await InAppPurchases.requestPurchase({ sku: productId });
      Alert.alert('Success', 'You are now a Premium user!');
      router.back();
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Error', 'Transaction failed. Please try again.');
    }
  };

  return (
    <View style={globalStyles.upgradeContainer}>
      <Text style={globalStyles.upgradeTitle}>Upgrade to Premium</Text>

      {/* Feature List */}
      <View style={globalStyles.upgradeFeatures}>
        <Text style={globalStyles.upgradeFeatureText}>✔ Unlimited Recording</Text>
        <Text style={globalStyles.upgradeFeatureText}>✔ Advanced Export (PDF, DOCX, SRT)</Text>
        <Text style={globalStyles.upgradeFeatureText}>✔ Custom Vocabulary for Better Accuracy</Text>
        <Text style={globalStyles.upgradeFeatureText}>✔ Faster Processing & Priority Support</Text>
      </View>

      {/* Subscription Options */}
      {products.map((product) => (
        <TouchableOpacity
          key={product.productId}
          style={globalStyles.upgradeButton}
          onPress={() => purchaseProduct(product.productId)}
        >
          <Text style={globalStyles.upgradeButtonText}>{product.price} {product.currency} - {product.title}</Text>
        </TouchableOpacity>
      ))}

      {/* Restore Purchases */}
      <TouchableOpacity
        style={[globalStyles.upgradeButton, globalStyles.upgradeRestoreButton]}
        onPress={async () => {
          try {
            await InAppPurchases.initConnection();
            const purchases = await InAppPurchases.getPurchaseHistory();
            if (purchases && purchases.length > 0) {
              Alert.alert('Success', 'Your purchases have been restored!');
            } else {
              Alert.alert('No Purchases', 'No previous purchases were found.');
            }
          } catch (error) {
            console.error('Restore failed:', error);
            Alert.alert('Error', 'Failed to restore purchases. Please try again.');
          }
        }}
      >
        <Text style={globalStyles.upgradeRestoreText}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}
