import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import LanguageSettings from '../../components/LanguageSettings';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen() {
  const { t } = useTranslation();
  
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>{t('settings')}</ThemedText>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('preferences')}</ThemedText>
          <LanguageSettings />
        </View>
        
        {/* Add more settings sections as needed */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('about')}</ThemedText>
          <View style={styles.aboutItem}>
            <ThemedText style={styles.aboutText}>
              {t('version')}: 1.0.0
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#909093',
  },
  aboutItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  aboutText: {
    fontSize: 16,
  }
});