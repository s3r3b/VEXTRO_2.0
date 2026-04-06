import React from 'react';

/**
 * VxMediaIcon – premium static multimedia icon.
 * Features a square with a play triangle and audio wave line.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxMediaIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Film frame/container */}
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
      
      {/* Play button triangle */}
      <path d="M10 8l6 4-6 4V8z" strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      
      {/* Audio wave at bottom */}
      <path d="M7 17h10M9 15h6M11 13h2" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
