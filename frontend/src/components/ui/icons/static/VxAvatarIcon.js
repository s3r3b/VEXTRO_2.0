import React from 'react';
import Svg, { Path, Circle, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

export const VxAvatarIcon = ({ size = 24, color = '#BF00FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <Filter id="avatarGlow" x="-30%" y="-30%" width="160%" height="160%">
        <FeGaussianBlur stdDeviation="2" result="blur" />
      </Filter>
    </Defs>
    <G filter="url(#avatarGlow)" opacity={0.3}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    </G>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} opacity={0.2} />
    <Circle cx="12" cy="8" r="3" stroke={color} strokeWidth={1.5} />
    <Path
      d="M18 19C18 15.686 15.314 13 12 13C8.686 13 6 15.686 6 19"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
