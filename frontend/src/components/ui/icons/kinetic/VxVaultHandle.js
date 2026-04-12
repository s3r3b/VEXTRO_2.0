import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

export const VxVaultHandle = ({ size = 24, color = '#00F3FF', isOpen = false }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isOpen ? 90 : 0, { damping: 12 });
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} opacity={0.3} />
        <Circle cx="12" cy="12" r="3" fill={color} />
        <Path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
};
