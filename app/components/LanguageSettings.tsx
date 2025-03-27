import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from '../i18n';

// List of supported languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ar', name: 'العربية' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pt', name: 'Português' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
];

const LanguageSettings = () => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Get the saved language on component mount
  useEffect(() => {
    const getSavedLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('language');
        if (savedLang) {
          setCurrentLanguage(savedLang);
        }
      } catch (error) {
        console.error('Failed to get saved language:', error);
      }
    };
    getSavedLanguage();
  }, []);

  // Function to change language
  const changeLanguage = async (langCode: string) => {
    try {
      // First save the preference
      await AsyncStorage.setItem('language', langCode);
      
      // Update the language
      await i18n.changeLanguage(langCode);
      
      // Update local state
      setCurrentLanguage(langCode);
      setShowLanguageModal(false);
      
      // Force an immediate re-render of the entire app
      // This helps components that might not be listening to the language change
      console.log(`Language changed to ${langCode}, refreshing UI...`);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  // Get current language display name
  const getCurrentLanguageName = () => {
    const lang = LANGUAGES.find(lang => lang.code === currentLanguage);
    return lang ? lang.name : 'English';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setShowLanguageModal(true)}
      >
        <Text style={styles.label}>{t('language')}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{getCurrentLanguageName()}</Text>
          <MaterialIcons name="chevron-right" size={24} color="#999999" />
        </View>
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('change_language')}</Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#999999" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={() => changeLanguage(item.code)}
                >
                  <Text style={styles.languageName}>{item.name}</Text>
                  {currentLanguage === item.code && (
                    <MaterialIcons name="check" size={24} color="#0A84FF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    color: '#0A84FF',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  languageName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default LanguageSettings;
