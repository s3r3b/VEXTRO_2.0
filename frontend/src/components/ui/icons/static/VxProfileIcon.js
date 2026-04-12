import React from 'react';
import Svg, { Path, Circle, Defs, Filter, FeGaussianBlur, G } from 'react-native-svg';

export const VxProfileIcon = ({ size = 24, color = '#BF00FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <FeGaussianBlur stdDeviation="1.5" result="blur" />
      </Filter>
    </Defs>
    {/* Subtle Glow Layer */}
    <G filter="url(#glow)" opacity={0.3}>
      <Circle cx="12" cy="8" r="4" fill={color} />
      <Path
        d="M20 21C20 17.134 16.866 14 12 14C7.134 14 4 17.134 4 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </G>
    {/* Main Icon */}
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.5} />
    <Path
      d="M20 21C20 17.134 16.866 14 12 14C7.134 14 4 17.134 4 21"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
