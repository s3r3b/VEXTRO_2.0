import React from 'react';
import Svg, { Circle, Path, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

export const VxRadarIcon = ({ size = 24, color = '#BF00FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1} opacity={0.2} />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1} opacity={0.4} />
    <Path d="M12 3V12L18.5 18.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);
