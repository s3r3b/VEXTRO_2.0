import React from 'react';

/**
 * VxMuteIcon – premium static mute notification icon.
 * Features a bell with a diagonal "glitch" line for "silenced" mode.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxMuteIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Bell shape */}
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 21a2 2 0 0 0 3.4 0" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Diagonal glitch line (Mute) */}
      <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
