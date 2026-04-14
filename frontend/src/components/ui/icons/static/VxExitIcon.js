import React from 'react';
import Svg, { Path, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

export const VxExitIcon = ({ size = 24, color = '#FF4B4B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <Filter id="exitGlow" x="-30%" y="-30%" width="160%" height="160%">
        <FeGaussianBlur stdDeviation="1.5" />
      </Filter>
    </Defs>
    <G filter="url(#exitGlow)" opacity={0.3}>
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth={2} />
    </G>
    <Path 
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" 
      stroke={color} 
      strokeWidth={1.5} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </Svg>
);
