import React from 'react';
import { motion } from 'framer-motion';

/**
 * VxAiSwitch – premium kinetic AI toggle switch.
 * Features a metallic/steel pattern and Framer Motion logic.
 * Props:
 *  - isOn: boolean
 *  - onToggle: function
 *  - size: number (scale factor, default 1)
 */
export default function VxAiSwitch({ isOn = false, onToggle, size = 1 }) {
  const primaryColor = 'var(--color-primary)'; // Neon for ON
  const secondaryColor = '#888888'; // Dead metal for OFF

  return (
    <div 
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        position: 'relative',
        scale: size
      }}
    >
      <svg width="60" height="30" viewBox="0 0 60 30">
        <defs>
          {/* Metallic Track Gradient */}
          <linearGradient id="metalTrack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#222" />
            <stop offset="50%" stopColor="#444" />
            <stop offset="100%" stopColor="#222" />
          </linearGradient>
          
          {/* Metallic Thumb Gradient */}
          <radialGradient id="metalThumb" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#eee" />
            <stop offset="60%" stopColor="#aaa" />
            <stop offset="100%" stopColor="#666" />
          </radialGradient>

          {/* Glow filter for ON state */}
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Bezel (Static) */}
        <rect x="0" y="0" width="60" height="30" rx="15" fill="#111" stroke="#333" strokeWidth="1" />
        
        {/* Track / Slot */}
        <rect x="5" y="5" width="50" height="20" rx="10" fill="url(#metalTrack)" />
        
        {/* Status Text (ON / OFF) */}
        <text 
          x="15" y="19" 
          fontFamily="Inter" fontSize="8" fontWeight="600" 
          fill={isOn ? primaryColor : "#333"}
          opacity={isOn ? 1 : 0.4}
          filter={isOn ? "url(#neonGlow)" : ""}
          style={{ pointerEvents: 'none', transition: 'all 0.3s' }}
        >
          ON
        </text>
        <text 
          x="35" y="19" 
          fontFamily="Inter" fontSize="8" fontWeight="600" 
          fill={!isOn ? "#666" : "#333"}
          opacity={!isOn ? 1 : 0.4}
          style={{ pointerEvents: 'none', transition: 'all 0.3s' }}
        >
          OFF
        </text>

        {/* The Sliding Thumb (Handle) */}
        <motion.g
          animate={{ x: isOn ? 30 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Shadow for the handle */}
          <circle cx="15" cy="15" r="10" fill="black" opacity="0.5" transform="translate(1, 1)" />
          {/* Main Handle Body */}
          <circle cx="15" cy="15" r="10" fill="url(#metalThumb)" stroke="#333" strokeWidth="0.5" />
          {/* Bevel Reflection */}
          <circle cx="12" cy="12" r="4" fill="white" opacity="0.3" pointerEvents="none" />
        </motion.g>
      </svg>
    </div>
  );
}
