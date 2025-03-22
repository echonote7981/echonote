import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import theme from '../styles/theme';

interface MenuOption {
  title: string;
  action: string;
  icon: string;
}

export default function HamburgerMenu() {
  // Main hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Modal states for different menu options
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  
  // User context
  const { setIsPremium } = useUser();
  
  // Translation
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Get the saved language on component mount
  useEffect(() => {
    const getSavedLanguage = async () => {
      const savedLang = await AsyncStorage.getItem('language');
      if (savedLang) {
        setCurrentLanguage(savedLang);
      }
    };
    getSavedLanguage();
  }, []);

  // Function to change language
  const changeLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('language', lang);
      i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };
  
  const router = useRouter();
  
  const menuOptions: MenuOption[] = [
    { title: 'Upgrade to Premium', action: 'upgrade', icon: 'star' },
    { title: 'Language Preference', action: 'language', icon: 'language' },
    { title: 'Terms and Conditions', action: 'terms', icon: 'description' },
    { title: 'Privacy Policy', action: 'privacy', icon: 'privacy-tip' }
  ];
  
  // List of available languages
  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh-CN', name: '中文' },
    { code: 'ar', name: 'العربية' },
    // Add more languages as needed
  ];
  
  const handleMenuAction = (action: string) => {
    setMenuVisible(false);
    
    // Handle different actions
    switch(action) {
      case 'upgrade':
        setUpgradeModalVisible(true);
        break;
      case 'language':
        setLanguageModalVisible(true);
        break;
      case 'terms':
        setTermsModalVisible(true);
        break;
      case 'privacy':
        setPrivacyModalVisible(true);
        break;
      default:
        break;
    }
  };
  
  const handleUpgrade = () => {
    // Close the upgrade modal
    setUpgradeModalVisible(false);
    // Navigate to the upgrade page
    router.push('/(tabs)/upgrade');
  };
  
  return (
    <View>
      <TouchableOpacity 
        onPress={() => setMenuVisible(true)}
        style={styles.hamburgerButton}
      >
        <MaterialIcons name="menu" size={28} color={theme.colors.primary} />
      </TouchableOpacity>
      
      {/* Main Hamburger Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {menuOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuAction(option.action)}
              >
                <MaterialIcons name={option.icon as any} size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Upgrade to Premium Modal */}
      <Modal
        visible={upgradeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUpgradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upgrade to Premium</Text>
              <TouchableOpacity onPress={() => setUpgradeModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Unlock all features with our premium subscription
            </Text>

            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>• Unlimited recordings</Text>
              <Text style={styles.featureItem}>• Advanced analytics</Text>
              <Text style={styles.featureItem}>• Priority support</Text>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.primaryButtonText}>Upgrade Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setUpgradeModalVisible(false)}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Language Preference Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Language Preference</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languageList}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.languageItem, 
                    currentLanguage === lang.code && styles.selectedLanguage]}
                  onPress={() => {
                    changeLanguage(lang.code);
                  }}
                >
                  <Text style={[styles.languageText, 
                    currentLanguage === lang.code && styles.selectedLanguageText]}>
                    {lang.name}
                  </Text>
                  {currentLanguage === lang.code && (
                    <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Terms Modal - Placeholder content */}
      <Modal
        visible={termsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.legalTextContainer}>
              <Text style={styles.legalText}>
                These Terms and Conditions ("Terms") govern your use of EchoNotes, a voice recording and transcription application. By using our application, you agree to these Terms.
              </Text>
              <Text style={styles.legalSectionTitle}>1. User Accounts</Text>
              <Text style={styles.legalText}>
                You may be required to create an account to use certain features of our application. You are responsible for maintaining the confidentiality of your account credentials.
              </Text>
              <Text style={styles.legalSectionTitle}>2. License</Text>
              <Text style={styles.legalText}>
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license to use the application for your personal, non-commercial purposes.
              </Text>
              <Text style={styles.legalSectionTitle}>3. Privacy</Text>
              <Text style={styles.legalText}>
                Your use of the application is also governed by our Privacy Policy, which can be found in the app menu.
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Text style={styles.primaryButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Privacy Policy Modal - Placeholder content */}
      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.legalTextContainer}>
              <Text style={styles.legalText}>
                This Privacy Policy describes how we collect, use, and disclose your information when you use our EchoNotes application.
              </Text>
              <Text style={styles.legalSectionTitle}>1. Information We Collect</Text>
              <Text style={styles.legalText}>
                We may collect information that you provide directly, such as when you create an account, upload content, or contact us for support. We also automatically collect certain information when you use the application.
              </Text>
              <Text style={styles.legalSectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.legalText}>
                We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.
              </Text>
              <Text style={styles.legalSectionTitle}>3. Data Security</Text>
              <Text style={styles.legalText}>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.primaryButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: '70%',
    height: '100%',
    backgroundColor: theme.colors.background,
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  modalDescription: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  featuresList: {
    marginVertical: 15,
  },
  featureItem: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 10,
  },
  languageList: {
    maxHeight: 300,
    marginVertical: 15,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedLanguage: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  languageText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  selectedLanguageText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  legalTextContainer: {
    maxHeight: 300,
    marginVertical: 15,
  },
  legalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 15,
    marginBottom: 8,
  },
  legalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
});
