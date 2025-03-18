import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pt', name: 'Português' },
  { code: 'zh-CN', name: '中文' },
  { code: 'zh-TW', name: '中文繁體' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  // Add more languages as you create translation files
];

const LanguageSettings = () => {
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

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{t('language')}</ThemedText>
      
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={styles.languageOption}
          onPress={() => changeLanguage(lang.code)}
        >
          <ThemedText style={styles.languageName}>{lang.name}</ThemedText>
          {currentLanguage === lang.code && (
            <MaterialIcons name="check" size={24} color="#0A84FF" />
          )}
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
};

// Keeping styles local in this component for now
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  languageName: {
    fontSize: 16,
  },
});

export default LanguageSettings;