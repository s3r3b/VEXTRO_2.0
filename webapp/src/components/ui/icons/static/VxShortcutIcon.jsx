import React from 'react';

/**
 * VxShortcutIcon – premium static add shortcut icon.
 * Features a diamond border with a central plus sign (VEXTRO signature).
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxShortcutIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* VEXTRO Diamond Border */}
      <path d="M12 4l8 8-8 8-8-8 8-8z" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Plus Symbol */}
      <line x1="12" y1="9" x2="12" y2="15" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="12" x2="15" y2="12" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
