import React from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUI } from '../context/UIContext';

const { width, height } = Dimensions.get('window');

/**
 * VEXTRO PREMIUM BACKGROUND
 * Dynamicznie zmienia kolory aur i tła na podstawie aktywnego motywu estetycznego.
 * Wszystkie motywy zdefiniowane w theme/wallpapers.js.
 */
export default function CyberBackground({ children }) {
  const { activeTheme } = useUI();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      {/* Górna aura */}
      <LinearGradient
        colors={activeTheme.auraTop}
        style={styles.auraTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Dolna aura */}
      <LinearGradient
        colors={activeTheme.auraBottom}
        style={styles.auraBottom}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Kontent z uwzględnieniem paska powiadomień Androida (iOS ogarniane przez natywny SafeAreaView) */}
      <View style={[StyleSheet.absoluteFill, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  auraTop: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.5,
    width: width * 2,
    height: height * 0.6,
    opacity: 0.8,
  },
  auraBottom: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.5,
    width: width * 2,
    height: height * 0.5,
    opacity: 0.6,
  }
});
