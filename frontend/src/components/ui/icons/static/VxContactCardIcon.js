import React from 'react';
import Svg, { Path, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

export const VxContactCardIcon = ({ size = 24, color = '#00F3FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <Filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
        <FeGaussianBlur stdDeviation="1" />
      </Filter>
    </Defs>
    <Path 
      d="M3 7V17L12 21L21 17V7L12 3L3 7Z" 
      stroke={color} 
      strokeWidth={1.5} 
      fill={color} 
      fillOpacity={0.05} 
    />
    <Path 
      d="M12 8V12M12 16H12.01" 
      stroke={color} 
      strokeWidth={2} 
      strokeLinecap="round" 
      filter="url(#cardGlow)" 
    />
  </Svg>
);
