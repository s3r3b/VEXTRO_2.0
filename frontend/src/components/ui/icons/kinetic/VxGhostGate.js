import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

export const VxGhostGate = ({ size = 24, color = '#BF00FF', active = true }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedG style={animatedStyle}>
        <Path 
          d="M9 14.66V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.34c0-1.87 1.54-3.39 3.43-3.32.22 0 .43.03.63.1.51.15.94.59.94 1.15v1.44a1 1 0 01-2 0v-.66c-.3.07-.58.26-.8.54-.4.51-.4 1.25 0 1.76.24.31.57.51.93.58a1 1 0 01.87 1v2.34a3 3 0 01-3 3h-4a3 3 0 01-3-3V11.23a1 1 0 112 0v2.34c.36-.07.69-.27.93-.58.4-.51.4-1.25 0-1.76-.22-.28-.5-.47-.8-.54v.66a1 1 0 11-2 0V9.92c0-.56.43-1 .94-1.15.2-.07.41-.1.63-.1 1.89-.07 3.43 1.45 3.43 3.32V14.66M12 2a5 5 0 00-5 5v4.23a3 3 0 003 3h4a3 3 0 003-3V7a5 5 0 00-5-5z" 
          fill={color} 
        />
      </AnimatedG>
    </Svg>
  );
};
