import React, { useMemo } from 'react';
import { Text, StyleSheet, View, Dimensions, ScrollView } from 'react-native';

interface TranscriptTextProps {
  text: string;
  style?: any;
  numberOfLines?: number;
  currentPosition?: number; // Current position in milliseconds
  totalDuration?: number; // Total duration in milliseconds
  scrollViewRef?: React.RefObject<ScrollView>;
}

function TranscriptText({ 
  text, 
  style, 
  numberOfLines, 
  currentPosition = 0, 
  totalDuration = 0,
  scrollViewRef
}: TranscriptTextProps) {
  // Split text into paragraphs for processing
  const paragraphs = useMemo(() => {
    return text
      .split('\n')
      .filter(paragraph => paragraph.trim().length > 0);
  }, [text]);

  // Calculate which part of the text should be highlighted based on current position
  const highlightProgress = useMemo(() => {
    if (!totalDuration || totalDuration <= 0) return 0;
    return Math.min(currentPosition / totalDuration, 1);
  }, [currentPosition, totalDuration]);

  // Get screen width to ensure text wrapping
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth - 32; // Account for padding

  // Auto-scroll to the current position if scrollViewRef is provided
  React.useEffect(() => {
    if (scrollViewRef?.current && highlightProgress > 0.05 && paragraphs.length > 5) {
      // Calculate approximate scroll position based on progress
      const estimatedScrollPosition = highlightProgress * (paragraphs.length * 24); // 24px per line approx
      scrollViewRef.current.scrollTo({ y: estimatedScrollPosition, animated: true });
    }
  }, [highlightProgress, scrollViewRef, paragraphs.length]);

  // If no highlighting needed (e.g., in preview mode), render simple text
  if (numberOfLines || !totalDuration) {
    const formattedText = paragraphs.join('\n\n');
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

  // For full transcript with highlighting
  return (
    <View style={[styles.container, { width: containerWidth }]}>
      {paragraphs.map((paragraph, index) => {
        // Calculate if this paragraph should be highlighted
        // More precise approach: determine which words should be highlighted based on progress
        const paragraphStart = (index / paragraphs.length);
        const paragraphEnd = ((index + 1) / paragraphs.length);
        const isCurrentParagraph = highlightProgress >= paragraphStart && highlightProgress <= paragraphEnd;
        
        if (!isCurrentParagraph) {
          // If not the current paragraph, render without highlighting
          return (
            <Text 
              key={index}
              style={[
                styles.transcript, 
                style,
                { marginBottom: 16 }
              ]}
            >
              {paragraph}
            </Text>
          );
        }
        
        // For the current paragraph, calculate how much of it should be highlighted
        const words = paragraph.split(' ');
        const progressWithinParagraph = (highlightProgress - paragraphStart) / (paragraphEnd - paragraphStart);
        const highlightedWordCount = Math.ceil(words.length * progressWithinParagraph);
        
        // Create two parts: highlighted and non-highlighted
        const highlightedPart = words.slice(0, highlightedWordCount).join(' ');
        const remainingPart = words.slice(highlightedWordCount).join(' ');
        
        return (
          <Text key={index} style={[styles.transcript, style, { marginBottom: 16 }]}>
            {highlightedPart.length > 0 && (
              <Text style={styles.highlightedText}>
                {highlightedPart}
                {remainingPart.length > 0 && ' '}
              </Text>
            )}
            {remainingPart}
          </Text>
        );
      })}
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
  highlightedText: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
    color: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    padding: 2,
  },
});

export default TranscriptText;
