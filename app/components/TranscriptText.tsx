import React from 'react';
import { Text, StyleSheet, View, Dimensions } from 'react-native';

interface TranscriptTextProps {
  text: string;
  style?: any;
  numberOfLines?: number;
}

function TranscriptText({ text, style, numberOfLines }: TranscriptTextProps) {
  // Split text into paragraphs and add proper spacing
  const formattedText = text
    .split('\n')
    .filter(paragraph => paragraph.trim().length > 0)
    .join('\n\n');

  // Get screen width to ensure text wrapping
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth - 32; // Account for padding

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <Text 
        style={[styles.transcript, style]} 
        numberOfLines={numberOfLines}
        ellipsizeMode="tail"
      >
        {formattedText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  transcript: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
});

export default TranscriptText;
