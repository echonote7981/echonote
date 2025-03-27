import React, { useMemo } from 'react';
import { Text, StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

interface TranscriptTextProps {
  text: string;
  style?: any;
  numberOfLines?: number;
  currentPosition?: number; // Current position in milliseconds
  totalDuration?: number; // Total duration in milliseconds
  scrollViewRef?: React.RefObject<ScrollView>;
  isPlaying?: boolean; // Whether audio is currently playing
}

function TranscriptText({ 
  text, 
  style, 
  numberOfLines, 
  currentPosition = 0, 
  totalDuration = 0,
  scrollViewRef,
  isPlaying = false
}: TranscriptTextProps) {
  // Split text into paragraphs for processing
  const paragraphs = useMemo(() => {
    return text
      .split('\n')
      .filter(paragraph => paragraph.trim().length > 0);
  }, [text]);
  const { t } = useTranslation();
  // Calculate which part of the text should be highlighted based on current position
  // Apply a small offset to account for audio processing delay
  const highlightProgress = useMemo(() => {
    // If audio is not playing, don't highlight anything new
    // This prevents highlighting from starting before audio actually plays
    if (!isPlaying) {
      // Return 0 if we're at the beginning, otherwise keep the last highlight position
      // This ensures we don't lose highlighting when pausing
      return currentPosition < 500 ? 0 : Math.min(currentPosition / totalDuration, 1);
    }
    
    if (!totalDuration || totalDuration <= 0) return 0;
    
    // Apply a small time offset (100ms) to account for audio processing delay
    // This helps synchronize the highlighting with the actual audio playback
    const adjustedPosition = Math.max(0, currentPosition - 100);
    
    // Ensure we don't exceed 1.0 (100%)
    return Math.min(adjustedPosition / totalDuration, 1);
  }, [currentPosition, totalDuration, isPlaying]);

  // Get screen width to ensure text wrapping
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth - 32; // Account for padding

  // Auto-scroll to the current position if scrollViewRef is provided
  // Use a debounced approach to avoid too frequent scrolling
  React.useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | undefined;
    
    if (scrollViewRef?.current && highlightProgress > 0.05 && paragraphs.length > 5) {
      // Clear any pending scroll operations
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Delay scrolling slightly to avoid jitter and ensure smoother experience
      scrollTimeout = setTimeout(() => {
        // Calculate which paragraph we're currently in
        const currentParagraphIndex = Math.floor(highlightProgress * paragraphs.length);
        
        // Calculate scroll position based on paragraph index rather than raw progress
        // This provides more accurate scrolling to the current paragraph
        const estimatedScrollPosition = currentParagraphIndex * 24; // 24px per line approx
        
        // Use smooth scrolling with a small delay
        scrollViewRef.current?.scrollTo({ 
          y: estimatedScrollPosition, 
          animated: true 
        });
      }, 200); // 200ms delay for smoother scrolling
    }
    
    return () => clearTimeout(scrollTimeout);
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
        // Use a more precise word-by-word approach for better synchronization
        const words = paragraph.split(' ');
        
        // Calculate progress within this specific paragraph with better precision
        let progressWithinParagraph = (highlightProgress - paragraphStart) / (paragraphEnd - paragraphStart);
        
        // Apply smoothing to avoid jumpy highlighting
        progressWithinParagraph = Math.max(0, Math.min(1, progressWithinParagraph));
        
        // Calculate the exact number of words to highlight based on precise progress
        const highlightedWordCount = Math.round(words.length * progressWithinParagraph);
        
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
