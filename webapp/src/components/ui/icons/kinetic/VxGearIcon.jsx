import React from 'react';
import { motion } from 'framer-motion';

/**
 * VxGearIcon – premium kinetic settings gear.
 * Props:
 *  - size: number (default 24)
 *  - state: 'idle' | 'hover' | 'active'
 *  - color: CSS color string (default 'var(--color-neon-green)')
 */
export default function VxGearIcon({ size = 24, state = 'idle', color = 'var(--color-neon-green)' }) {
  const neonGlow = {
    filter: `drop-shadow(0 0 6px ${color})`,
    stroke: color,
    fill: 'none',
  };

  const variants = {
    idle: { rotate: 0, scale: 1 },
    hover: { rotate: 15, scale: 1.08 },
    active: { rotate: [0, 360], transition: { duration: 0.8, repeat: 0 } },
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
      {/* Gear teeth */}
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" />
      {/* Central circle */}
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </motion.svg>
  );
}
