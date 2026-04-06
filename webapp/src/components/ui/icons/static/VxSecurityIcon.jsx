import React from 'react';

/**
 * VxSecurityIcon – premium static core security icon.
 * Features a diamond shape (romb) with a keyhole for "circuit" security.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxSecurityIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Diamond / Shield border */}
      <path d="M12 2l10 10-10 10-10-10L12 2z" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Keyhole / Lock Body */}
      <path d="M12 8v4" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="14" r="1.5" strokeWidth="1.2" />
    </svg>
  );
}
