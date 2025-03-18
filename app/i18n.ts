import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'; // ✅ Required
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

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
  en: { translation: { welcome: "Welcome to EchoNotes", settings: "Settings" } },
  fr: { translation: { welcome: "Bienvenue à EchoNotes", settings: "Paramètres" } },
  es: { translation: { welcome: "¡Bienvenido a EchoNotes!", settings: "Configuraciones" } },
  de: { translation: { welcome: "Willkommen bei EchoNotes", settings: "Einstellungen" } },
  it: { translation: { welcome: "Benvenuto in EchoNotes", settings: "Impostazioni" } },
  ar: { translation: { welcome: "مرحبًا بكم في EchoNotes", settings: "الإعدادات" } },
  ja: { translation: { welcome: "EchoNotesへようこそ", settings: "設定" } },
  ko: { translation: { welcome: "EchoNotes에 오신 것을 환영합니다", settings: "설정" } },
  nl: { translation: { welcome: "Welkom bij EchoNotes", settings: "Instellingen" } },
  pt: { translation: { welcome: "Bem-vindo ao EchoNotes", settings: "Configurações" } },    
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
    // Use dynamic import to avoid the TurboModuleRegistry error
    const RNLocalize = require('react-native-localize');
    
    // Get user's device locales
    const deviceLocales = RNLocalize.getLocales();
    
    // Find the first locale that matches our available languages
    for (const locale of deviceLocales) {
      const languageCode = locale.languageCode;
      if (Object.keys(resources).includes(languageCode)) {
        return languageCode;
      }
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
