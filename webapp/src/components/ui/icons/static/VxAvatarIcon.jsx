import React from 'react';

/**
 * VxAvatarIcon – premium static avatar for VEXTRO.
 * Hexagon shaped silhouette for the "node" aesthetic.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxAvatarIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Hexagon Border */}
      <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Silhouette */}
      <path d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" strokeWidth="1.5" />
      <path d="M7 18c0-2 2-3.5 5-3.5s5 1.5 5 3.5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
