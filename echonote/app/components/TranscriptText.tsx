import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface TranscriptTextProps {
  text: string;
  style?: any;
}

function TranscriptText({ text, style }: TranscriptTextProps) {
  // Split text into paragraphs and add proper spacing
  const formattedText = text
    .split('\n')
    .filter(paragraph => paragraph.trim().length > 0)
    .join('\n\n');

  return (
    <Text style={[styles.transcript, style]}>
      {formattedText}
    </Text>
  );
}

const styles = StyleSheet.create({
  transcript: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default TranscriptText;
