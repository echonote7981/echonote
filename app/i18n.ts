import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';
import ar from './locales/ar.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import pt from './locales/pt.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';

// Available languages
const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  ar: { translation: ar },
  ja: { translation: ja },
  ko: { translation: ko },
  nl: { translation: nl },
  pt: { translation: pt },    
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
};

// Detect user's language preference
const getLanguage = async () => {
  // First, check if user has saved a language preference
  try {
    const savedLang = await AsyncStorage.getItem('language');
    if (savedLang) return savedLang;
  } catch (e) {
    console.warn('Failed to get saved language preference', e);
  }

  // Try to get user's device locale with a safe fallback
  try {
    // Get user's device locale using expo-localization
    const locale = Localization.locale;
    const languageCode = locale.split('-')[0]; // Get the language part (e.g., 'en' from 'en-US')
    
    // Check if this language is in our resources
    if (Object.keys(resources).includes(languageCode)) {
      return languageCode;
    }
    
    // For languages with region codes like zh-CN, zh-TW
    if (Object.keys(resources).includes(locale)) {
      return locale;
    }
  } catch (e) {
    console.warn('Failed to get device locale, falling back to English', e);
  }

  // Fallback to English
  return 'en';
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

// Set the language asynchronously
getLanguage().then((language) => {
  i18n.changeLanguage(language);
}).catch(() => {
  i18n.changeLanguage('en');
});

export default i18n;
