import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DetailSectionProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  children: React.ReactNode;
  label?: string;
  rightContent?: React.ReactNode;
  count?: number;
}

function DetailSection({ icon, children, label, rightContent, count }: DetailSectionProps) {
  return (
    <View style={styles.section}>
      {label ? (
        <>
          <View style={styles.headerRow}>
            <View style={styles.labelContainer}>
              <MaterialIcons name={icon} size={24} color="#FFFFFF" style={styles.icon} />
              <Text style={styles.label}>
                {label}
                {count !== undefined && (
                  <Text style={styles.count}> ({count})</Text>
                )}
              </Text>
            </View>
            {rightContent}
          </View>
          <View style={styles.contentRow}>
            {children}
          </View>
        </>
      ) : (
        <View style={styles.inlineRow}>
          <MaterialIcons name={icon} size={24} color="#FFFFFF" style={styles.icon} />
          {children}
          {rightContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  count: {
    color: '#999999',
    fontWeight: '400',
  },
});

export default DetailSection;
