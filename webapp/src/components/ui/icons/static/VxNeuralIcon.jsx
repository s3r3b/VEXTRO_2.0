import React from 'react';

/**
 * VxNeuralIcon – premium static VEXTRO AI icon.
 * Features a neural network map with interconnected nodes.
 * Props:
 *  - size: number (default 24)
 *  - color: CSS color string (default 'var(--color-primary)')
 */
export default function VxNeuralIcon({ size = 24, color = 'var(--color-primary)' }) {
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
      {/* Neural network nodes (Hexagonal locations) */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
      <circle cx="12" cy="4" r="1" fill={color} opacity="0.8" />
      <circle cx="12" cy="20" r="1" fill={color} opacity="0.8" />
      <circle cx="5" cy="8" r="1" fill={color} opacity="0.8" />
      <circle cx="19" cy="8" r="1" fill={color} opacity="0.8" />
      <circle cx="5" cy="16" r="1" fill={color} opacity="0.8" />
      <circle cx="19" cy="16" r="1" fill={color} opacity="0.8" />
      
      {/* Connections (Synapses) */}
      <path d="M12 4L12 11M12 13L12 20" strokeWidth="1" strokeLinecap="round" strokeDasharray="1 1" />
      <path d="M5 8L11 11M13 13L19 16" strokeWidth="1" strokeLinecap="round" strokeDasharray="1 1" />
      <path d="M19 8L13 11M11 13L5 16" strokeWidth="1" strokeLinecap="round" strokeDasharray="1 1" />
    </svg>
  );
}
