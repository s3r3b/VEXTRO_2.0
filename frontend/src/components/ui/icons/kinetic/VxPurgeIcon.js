import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

export const VxPurgeIcon = ({ size = 24, color = '#FF4B4B', shaking = false }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (shaking) {
      rotation.value = withRepeat(
        withSequence(withTiming(-5, { duration: 50 }), withTiming(5, { duration: 50 })),
        5,
        true
      );
    }
  }, [shaking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
};
