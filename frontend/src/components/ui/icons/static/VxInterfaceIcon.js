import React from 'react';
import Svg, { Rect, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

export const VxInterfaceIcon = ({ size = 24, color = '#00F3FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <Filter id="knobGlow" x="-20%" y="-20%" width="140%" height="140%">
        <FeGaussianBlur stdDeviation="1.5" result="blur" />
      </Filter>
    </Defs>
    {/* Slider 1 */}
    <Rect x="4" y="6" width="16" height="2" rx="1" fill={color} opacity={0.15} />
    <G filter="url(#knobGlow)" opacity={0.4}>
      <Rect x="14" y="4" width="2" height="6" rx="1" fill={color} />
    </G>
    <Rect x="14" y="4" width="2" height="6" rx="1" fill={color} />

    {/* Slider 2 */}
    <Rect x="4" y="12" width="16" height="2" rx="1" fill={color} opacity={0.15} />
    <G filter="url(#knobGlow)" opacity={0.4}>
      <Rect x="8" y="10" width="2" height="6" rx="1" fill={color} />
    </G>
    <Rect x="8" y="10" width="2" height="6" rx="1" fill={color} />

    {/* Slider 3 */}
    <Rect x="4" y="18" width="16" height="2" rx="1" fill={color} opacity={0.15} />
    <G filter="url(#knobGlow)" opacity={0.4}>
      <Rect x="12" y="16" width="2" height="6" rx="1" fill={color} />
    </G>
    <Rect x="12" y="16" width="2" height="6" rx="1" fill={color} />
  </Svg>
);
