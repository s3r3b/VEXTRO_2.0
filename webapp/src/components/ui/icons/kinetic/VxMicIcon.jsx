import React from 'react';
import { motion } from 'framer-motion';

/**
 * VxMicIcon – premium kinetic microphone button.
 * Props:
 *  - size: number (default 24)
 *  - state: 'idle' | 'hover' | 'recording' | 'loading'
 *  - color: CSS color string (default 'var(--color-neon)')
 */
export default function VxMicIcon({ size = 24, state = 'idle', color = 'var(--color-neon)' }) {
  const isRecording = state === 'recording';
  const neonGlow = {
    filter: `drop-shadow(0 0 6px ${color})`,
    stroke: color,
    fill: isRecording ? color : 'none',
  };

  const variants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.08 },
    recording: { scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] },
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
      {/* Microphone body */}
      <path d="M12 1a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" />
      {/* Stand */}
      <line x1="12" y1="14" x2="12" y2="20" strokeWidth="2" />
      {/* Base */}
      <line x1="9" y1="20" x2="15" y2="20" strokeWidth="2" />
    </motion.svg>
  );
}
