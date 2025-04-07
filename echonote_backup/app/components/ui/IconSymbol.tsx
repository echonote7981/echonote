import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

interface IconSymbolProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
}

function IconSymbol({ name, size = 24, color = '#FFFFFF' }: IconSymbolProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

export default IconSymbol;
