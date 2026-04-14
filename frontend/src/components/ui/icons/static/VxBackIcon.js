import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const VxBackIcon = ({ size = 24, color = '#00F3FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
