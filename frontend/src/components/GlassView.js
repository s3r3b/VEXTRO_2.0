import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { VextroTheme } from '../theme/colors';

/**
 * VEXTRO PREMIUM GLASSVIEW
 * Kontener realizujący efekt Glassmorphism przy użyciu natywnego rozmycia GPU.
 */
export default function GlassView({ children, style, intensity = 20 }) {
  return (
    <View style={[styles.container, style]}>
      <BlurView 
        intensity={intensity} 
        tint="dark" 
        style={StyleSheet.absoluteFill} 
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.borderOverlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: VextroTheme.surfaceBorder,
    backgroundColor: 'rgba(15, 10, 30, 0.2)',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
  }
});
