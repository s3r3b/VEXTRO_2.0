import React from 'react';

/**
 * VxProfileIcon – premium static profile icon.
 * Includes a "signal" above the silhouette for "node" communication.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxProfileIcon({ size = 24, color = 'var(--color-primary)' }) {
  const glow = {
    filter: `drop-shadow(0 0 2px ${color})`,
    stroke: color,
    fill: 'none',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={glow}
    >
      {/* Avatar border */}
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      {/* Head and body */}
      <circle cx="12" cy="10" r="3" strokeWidth="1.5" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" strokeWidth="1.5" />
      {/* Signal Arc (The VEXTRO Detail) */}
      <path d="M9 5c2-2 4-2 6 0" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
