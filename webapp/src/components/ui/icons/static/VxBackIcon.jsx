import React from 'react';

/**
 * VxBackIcon – premium static back arrow icon.
 * Features a primary arrow with two thin trailing lines for movement.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxBackIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Primary Back Arrow */}
      <polyline points="12 18 6 12 12 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="12" x2="18" y2="12" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Motion Trails */}
      <line x1="20" y1="12" x2="22" y2="12" strokeWidth="0.8" opacity="0.4" />
      <line x1="18" y1="12" x2="19" y2="12" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
