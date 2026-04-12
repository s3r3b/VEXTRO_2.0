import React, { useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const VxMicIcon = ({ size = 24, color = '#BF00FF', active = false }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(withSpring(1.2), -1, true);
      opacity.value = withRepeat(withTiming(0.8, { duration: 1000 }), -1, true);
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(0.3);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedCircle 
        cx="12" cy="12" r="10" 
        fill={color} 
        style={animatedStyle}
      />
      <Path
        d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
        fill={color}
      />
      <Path
        d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};
