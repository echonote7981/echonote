import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

type UserContextType = {
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
  hasAcceptedTerms: boolean;
  setHasAcceptedTerms: (accepted: boolean) => void;
  hasAcceptedPrivacyPolicy: boolean;
  setHasAcceptedPrivacyPolicy: (accepted: boolean) => void;
  saveUserPreferences: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  isPremium: false,
  setIsPremium: () => {},
  hasAcceptedTerms: false,
  setHasAcceptedTerms: () => {},
  hasAcceptedPrivacyPolicy: false,
  setHasAcceptedPrivacyPolicy: () => {},
  saveUserPreferences: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const [isPremium, setIsPremium] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState(false);

  // Load user preferences from AsyncStorage on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const userPrefsString = await AsyncStorage.getItem('userPreferences');
        if (userPrefsString) {
          const userPrefs = JSON.parse(userPrefsString);
          setIsPremium(userPrefs.isPremium || false);
          setHasAcceptedTerms(userPrefs.hasAcceptedTerms || false);
          setHasAcceptedPrivacyPolicy(userPrefs.hasAcceptedPrivacyPolicy || false);
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  // Save user preferences to AsyncStorage
  const saveUserPreferences = async () => {
    try {
      const userPrefs = {
        isPremium,
        hasAcceptedTerms,
        hasAcceptedPrivacyPolicy,
      };
      await AsyncStorage.setItem('userPreferences', JSON.stringify(userPrefs));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  };

  // Save preferences whenever they change
  useEffect(() => {
    saveUserPreferences();
  }, [isPremium, hasAcceptedTerms, hasAcceptedPrivacyPolicy]);

  return (
    <UserContext.Provider 
      value={{ 
        isPremium, 
        setIsPremium, 
        hasAcceptedTerms, 
        setHasAcceptedTerms,
        hasAcceptedPrivacyPolicy, 
        setHasAcceptedPrivacyPolicy,
        saveUserPreferences
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// Add default export to fix routing warning
export default UserProvider;