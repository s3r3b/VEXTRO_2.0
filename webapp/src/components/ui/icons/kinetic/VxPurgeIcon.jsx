import React from 'react';
import { motion } from 'framer-motion';

/**
 * VxPurgeIcon – premium kinetic trash/purge button.
 * Trash can tilts and "empties" its content on active.
 * Props:
 *  - size: number (default 24)
 *  - state: 'idle' | 'hover' | 'active'
 *  - color: CSS color string (default 'var(--color-neon-red)')
 */
export default function VxPurgeIcon({ size = 24, state = 'idle', color = 'var(--color-neon-red)' }) {
  const neonGlow = {
    filter: `drop-shadow(0 0 6px ${color})`,
    stroke: color,
    fill: 'none',
  };

  const binVariants = {
    idle: { rotate: 0, x: 0, y: 0 },
    hover: { rotate: -10, transition: { duration: 0.2 } },
    active: { 
      rotate: [ -10, -110, 0 ],
      x: [ 0, -2, 0 ],
      y: [ 0, 0, 0 ],
      transition: { duration: 1.2, times: [0, 0.4, 0.8], ease: "easeInOut" }
    },
  };

  const particleVariants = {
    idle: { opacity: 0, scale: 0, y: 0, rotate: 0 },
    active: { 
      opacity: [0, 1, 0],
      scale: [0, 1, 0.5],
      y: [ 0, 10, 20 ],
      rotate: [ 0, 180, 360 ],
      transition: { duration: 1, delay: 0.4 }
    }
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
      {/* Bin Body (Tilting part) */}
      <motion.g variants={binVariants} style={{ originX: '12px', originY: '20px' }}>
        <path d="M3 6h18" strokeWidth="1.5" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeWidth="1.5" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="1.5" />
        <line x1="10" y1="11" x2="10" y2="17" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="14" y1="11" x2="14" y2="17" strokeWidth="1.2" strokeLinecap="round" />
      </motion.g>

      {/* Falling data particles when tilted */}
      <motion.rect
        x="6"
        y="12"
        width="2"
        height="2"
        fill={color}
        variants={particleVariants}
      />
      <motion.rect
        x="10"
        y="10"
        width="1.5"
        height="1.5"
        fill={color}
        variants={particleVariants}
        transition={{ delay: 0.5 }}
      />
      <motion.rect
        x="14"
        y="13"
        width="1"
        height="1"
        fill={color}
        variants={particleVariants}
        transition={{ delay: 0.6 }}
      />
    </motion.svg>
  );
}
