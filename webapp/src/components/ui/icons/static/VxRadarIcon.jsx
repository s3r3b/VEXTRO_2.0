import React from 'react';

/**
 * VxRadarIcon – premium static search/radar icon.
 * Features a circular radar with crosshair scanning.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxRadarIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Radar rings */}
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5" strokeWidth="1.2" opacity="0.6" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
      
      {/* Crosshair (Scanning) */}
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}
