import React from 'react';
import Svg, { Path, Defs, Filter, FeGaussianBlur, G } from 'react-native-svg';

export const VxSecurityIcon = ({ size = 24, color = '#00F3FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <Filter id="shieldGlow" x="-30%" y="-30%" width="160%" height="160%">
        <FeGaussianBlur stdDeviation="1.8" result="blur" />
      </Filter>
    </Defs>
    <G filter="url(#shieldGlow)" opacity={0.4}>
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth={2}
      />
    </G>
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
