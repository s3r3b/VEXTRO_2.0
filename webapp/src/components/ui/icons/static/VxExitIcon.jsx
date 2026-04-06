import React from 'react';

/**
 * VxExitIcon – premium static logout/exit icon.
 * Features a portal with an arrow pointing outwards.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxExitIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Portal (Open square) */}
      <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Exit Arrow */}
      <polyline points="16 17 21 12 16 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
