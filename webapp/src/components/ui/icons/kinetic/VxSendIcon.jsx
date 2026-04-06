import React from 'react';
import { motion } from 'framer-motion';

/**
 * VxSendIcon – premium kinetic send button.
 * Props:
 *  - size: number (default 24)
 *  - state: 'idle' | 'hover' | 'active'
 *  - color: CSS color string (default 'var(--color-neon)')
 */
export default function VxSendIcon({ size = 24, state = 'idle', color = 'var(--color-neon)' }) {
  const neonGlow = {
    filter: `drop-shadow(0 0 6px ${color})`,
    stroke: color,
    fill: 'none',
  };

  const variants = {
    idle: { scale: 1 },
    hover: { scale: 1.08 },
    active: { scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] },
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={neonGlow}
      whileHover="hover"
      whileTap="active"
      animate={state}
      variants={variants}
    >
      {/* Arrow shape */}
      <path d="M2 12l20 0" strokeWidth="2" />
      <polygon points="12,2 22,12 12,22" strokeWidth="2" />
    </motion.svg>
  );
}
