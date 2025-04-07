import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

interface SeeMoreLinkProps {
  onPress: () => void;
  style?: any;
}

function SeeMoreLink({ onPress, style }: SeeMoreLinkProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text style={styles.seeMoreText}>See More</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  seeMoreText: {
    color: '#0A84FF',
    fontSize: 14,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});

export default SeeMoreLink;
