import React from 'react';

/**
 * VxMoreIcon – premium static more options icon.
 * Features 3 horizontal lines with tuned points (filter/tuner style).
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxMoreIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* 3 horizontal paths with filter points */}
      <line x1="4" y1="7" x2="20" y2="7" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="8" cy="7" r="1.5" fill={color} />
      
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="12" r="1.5" fill={color} />
      
      <line x1="4" y1="17" x2="20" y2="17" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="10" cy="17" r="1.5" fill={color} />
    </svg>
  );
}
