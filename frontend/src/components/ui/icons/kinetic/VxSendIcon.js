import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const VxSendIcon = ({ size = 24, color = '#00F3FF', isSending = false }) => {
  const offset = useSharedValue(0);

  useEffect(() => {
    if (isSending) {
      offset.value = withSequence(
        withSpring(5),
        withTiming(0, { duration: 200 })
      );
    }
  }, [isSending]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }, { translateY: -offset.value }],
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animatedStyle}
      />
    </Svg>
  );
};
