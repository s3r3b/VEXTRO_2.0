import React from 'react';
import { motion } from 'framer-motion';

/**
 * VxGhostGate – premium kinetic ghost mode icon.
 * Features a ghost passing through a "vault door/shield".
 * Props:
 *  - size: number (default 24)
 *  - state: 'idle' | 'hover' | 'active'
 *  - color: CSS color string (default 'var(--color-neon-cyan)')
 */
export default function VxGhostGate({ size = 24, state = 'idle', color = 'var(--color-neon-cyan)' }) {
  const neonGlow = {
    filter: `drop-shadow(0 0 6px ${color})`,
    stroke: color,
    fill: 'none',
  };

  const ghostVariants = {
    idle: { x: -4, opacity: 0.6, scale: 0.9 },
    hover: { x: -2, opacity: 1, scale: 1 },
    active: { 
      x: [ -4, 0, 4 ],
      opacity: [ 0.6, 1, 0 ],
      scale: [ 0.9, 1.1, 0.8 ],
      transition: { duration: 0.6, times: [0, 0.5, 1] }
    },
  };

  const gateVariants = {
    idle: { scale: 1, opacity: 0.8 },
    hover: { scale: 1.05, opacity: 1 },
    active: { 
      scale: [ 1, 1.3, 1 ],
      opacity: [ 0.8, 1, 0.8 ],
      transition: { duration: 0.4, delay: 0.2 }
    },
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
    >
      {/* Gate / Shield (Right side) */}
      <motion.path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        strokeWidth="1.5"
        variants={gateVariants}
      />
      
      {/* Ghost (Moving from left to right) */}
      <motion.g variants={ghostVariants}>
        <path
          d="M9 10c0-1.5 1.5-3 3-3s3 1.5 3 3v4c0 1.5-1.5 1.5-1.5 1.5S12 15.5 12 14s-1.5 1.5-1.5 1.5S9 15.5 9 14v-4z"
          strokeWidth="1.5"
          fill={state === 'active' ? color : 'none'}
          fillOpacity={0.2}
        />
        <circle cx="11" cy="9.5" r="0.5" fill={color} />
        <circle cx="13" cy="9.5" r="0.5" fill={color} />
      </motion.g>
    </motion.svg>
  );
}
