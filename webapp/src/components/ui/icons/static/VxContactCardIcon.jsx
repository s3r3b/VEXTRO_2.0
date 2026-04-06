import React from 'react';

/**
 * VxContactCardIcon – premium static contact card icon.
 * Features a rectangle with a chip-like detail (ID card).
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxContactCardIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Card border */}
      <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.5" />
      {/* Chip detail */}
      <rect x="6" y="8" width="4" height="3" rx="0.5" strokeWidth="1" />
      {/* Info lines */}
      <line x1="13" y1="9" x2="18" y2="9" strokeWidth="1" strokeLinecap="round" />
      <line x1="13" y1="13" x2="18" y2="13" strokeWidth="1" strokeLinecap="round" />
      <line x1="6" y1="15" x2="18" y2="15" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
