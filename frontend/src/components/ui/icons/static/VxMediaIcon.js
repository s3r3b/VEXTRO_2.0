import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const VxMediaIcon = ({ size = 24, color = '#00F3FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={1.5} />
    <Path d="M3 16l5-5 3 3 5-5 5 5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="7" y="7" width="2" height="2" rx="1" fill={color} />
  </Svg>
);
