// Ścieżka: /workspaces/VEXTRO/frontend/src/components/ScaledText.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useUI } from '../context/UIContext';

/**
 * VEXTRO 4.5 SCALED TEXT
 * Komponent reagujący na globalny fontSizeFactor.
 * Automatycznie dostosowuje wielkość liter w całej aplikacji.
 */
const ScaledText = ({ style, children, ...props }) => {
  const { fontSizeFactor } = useUI();

  // Wyciągamy fontSize ze stylu (jeśli istnieje) lub domyślnie 14
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const baseFontSize = flattenedStyle.fontSize || 14;
  
  // Interpolacja wielkości
  const newFontSize = baseFontSize * fontSizeFactor;

  return (
    <Text 
      style={[style, { fontSize: newFontSize }]} 
      {...props}
    >
      {children}
    </Text>
  );
};

export default ScaledText;
