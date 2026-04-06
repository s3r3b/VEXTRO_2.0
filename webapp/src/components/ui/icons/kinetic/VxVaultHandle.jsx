import React from 'react';
import { motion } from 'framer-motion';

/**
 * VxVaultHandle – premium kinetic handle for chat options.
 * Props:
 *  - size: number (default 24)
 *  - state: 'idle' | 'open' | 'hover'
 *  - color: CSS color string (default 'var(--color-neon-blue)')
 */
export default function VxVaultHandle({ size = 24, state = 'idle', color = 'var(--color-neon-blue)' }) {
  const neonGlow = {
    filter: `drop-shadow(0 0 6px ${color})`,
    stroke: color,
    fill: 'none',
  };

  const variants = {
    idle: { rotate: 0, scale: 1 },
    hover: { rotate: 10, scale: 1.05 },
    open: { rotate: 90, scale: 1 },
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={neonGlow}
      whileHover="hover"
      animate={state}
      variants={variants}
    >
      {/* Handle – stylised lever */}
      <path d="M6 12h12" strokeWidth="2" />
      <path d="M12 6v12" strokeWidth="2" />
      {/* Optional decorative arc */}
      <path d="M6 12a6 6 0 0 1 12 0" strokeWidth="2" fill="none" />
    </motion.svg>
  );
}
