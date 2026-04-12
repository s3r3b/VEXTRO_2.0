import React from 'react';
import Svg, { Circle, Path, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

export const VxNeuralIcon = ({ size = 24, color = '#BF00FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <Filter id="neuralGlow" x="-30%" y="-30%" width="160%" height="160%">
        <FeGaussianBlur stdDeviation="2" result="blur" />
      </Filter>
    </Defs>
    <G filter="url(#neuralGlow)" opacity={0.35}>
       <Circle cx="12" cy="12" r="3" fill={color} />
       <Path d="M12 9V4M12 20v-5M15 12h5M4 12h5" stroke={color} strokeWidth={2} />
    </G>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
    <Path 
      d="M12 9V4M12 20v-5M15 12h5M4 12h5M18.5 5.5l-2.5 2.5M8 16l-3 3M18.5 18.5l-2.5-2.5M8 8L5 5" 
      stroke={color} 
      strokeWidth={1.5} 
      strokeLinecap="round" 
    />
  </Svg>
);
