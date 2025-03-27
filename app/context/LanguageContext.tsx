import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import * as Localization from 'expo-localization';

// Define the shape of our context
interface LanguageContextType {
  currentLanguage: string;
  setAppLanguage: (languageCode: string) => Promise<void>;
  isRTL: boolean;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  setAppLanguage: async () => {},
  isRTL: false
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState(false);
  // Force re-render when language changes
  const [forceUpdate, setForceUpdate] = useState(0);

  // Check for RTL languages
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  
  // Add a language change listener to force UI updates
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log(`Language changed to: ${lng}`);
      // This will force components to re-render
      setForceUpdate(prev => prev + 1);
    };
    
    // Register the language change event listener
    i18n.on('languageChanged', handleLanguageChange);
    
    // Clean up the listener when component unmounts
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Initialize language on app start
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // First try to get the saved language preference
        const savedLanguage = await AsyncStorage.getItem('language');
        
        if (savedLanguage) {
          // User has a saved preference
          await setAppLanguage(savedLanguage);
        } else {
          // No saved preference, use device locale
          const deviceLocale = Localization.locale.split('-')[0];
          // Check if we support this language
          const supportedLanguages = Object.keys(i18n.options.resources || {});
          
          if (supportedLanguages.includes(deviceLocale)) {
            await setAppLanguage(deviceLocale);
          } else {
            // Fallback to English
            await setAppLanguage('en');
          }
        }
      } catch (error) {
        console.error('Failed to initialize language:', error);
        // Default to English in case of errors
        await setAppLanguage('en');
      }
    };

    initializeLanguage();
  }, []);

  // Function to set the app language
  const setAppLanguage = async (languageCode: string): Promise<void> => {
    try {
      // Change language in i18n
      await i18n.changeLanguage(languageCode);
      
      // Update state
      setCurrentLanguage(languageCode);
      
      // Check if RTL language
      setIsRTL(rtlLanguages.includes(languageCode));
      
      // Save preference for next app launch
      await AsyncStorage.setItem('language', languageCode);
    } catch (error) {
      console.error('Failed to set app language:', error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setAppLanguage,
        isRTL
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
