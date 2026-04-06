import React from 'react';

/**
 * VxInterfaceIcon – premium static interface tuning icon.
 * Features 3 vertical lines with adjustable "points" for a tuning/EQ aesthetic.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxInterfaceIcon({ size = 24, color = 'var(--color-primary)' }) {
  const glow = {
    filter: `drop-shadow(0 0 2px ${color})`, stroke: color, fill: 'none',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={glow}
    >
      {/* 3 adjustment sliders */}
      <line x1="6" y1="3" x2="6" y2="21" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="18" y1="3" x2="18" y2="21" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      
      {/* Points (The "tuning" markers) */}
      <circle cx="6" cy="15" r="2" fill={color} />
      <circle cx="12" cy="7" r="2" fill={color} />
      <circle cx="18" cy="18" r="2" fill={color} />
    </svg>
  );
}
