import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const VxMuteIcon = ({ size = 24, color = '#FF4B4B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 5L6 9H2v6h4l5 4V5z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M23 9l-6 6M17 9l6 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);
