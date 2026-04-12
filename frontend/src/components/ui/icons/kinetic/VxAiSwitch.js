import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolateColor } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export const VxAiSwitch = ({ isOn, onToggle }) => {
  const translateX = useSharedValue(isOn ? 24 : 0);

  const toggle = () => {
    translateX.value = withSpring(isOn ? 0 : 24, { damping: 15 });
    onToggle?.();
  };

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [0, 24],
      ['rgba(255,255,255,0.05)', 'rgba(191,0,255,0.1)']
    ),
  }));

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggle} style={styles.container}>
      <Animated.View style={[styles.track, animatedBgStyle]}>
        <Animated.View style={[styles.thumb, animatedThumbStyle]}>
          <LinearGradient
            colors={['#e0e0e0', '#8e8e8e', '#454545']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.steelEffect}
          />
          {isOn && <View style={styles.neonDot} />}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 50, height: 26 },
  track: { 
    flex: 1, 
    borderRadius: 13, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    padding: 2 
  },
  thumb: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5
  },
  steelEffect: { ...StyleSheet.absoluteFillObject },
  neonDot: { 
    width: 4, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#BF00FF',
    shadowColor: '#BF00FF',
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 10
  }
});
