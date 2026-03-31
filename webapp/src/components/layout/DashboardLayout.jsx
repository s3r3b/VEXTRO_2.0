import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Wygładzanie ruchu "mgławicy" podążającej za myszą
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col font-sans selection:bg-primary/40">
      {/* KINETYCZNA WARSTWA TŁA (GLOW) */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"
        style={{
          left: springX,
          top: springY,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none z-0"></div>

      {/* STRUKTURA KOKPITU */}
      <main className="relative z-10 flex flex-1 w-full h-full overflow-hidden p-4 gap-4">
        {children}
      </main>
      
      {/* DOLNY PASEK STATUSU (TERMINAL FOOTER) */}
      <footer className="relative z-10 h-8 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center px-6 justify-between overflow-hidden">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-primary animate-pulse">● SYSTEM ONLINE</span>
          <span className="text-[10px] font-mono text-textMuted uppercase tracking-widest">Encrypted Tunnel: AES-256-GCM</span>
        </div>
        <div className="text-[10px] font-mono text-textMuted uppercase">
          VEXTRO v1.0.4-beta / {new Date().toLocaleTimeString()}
        </div>
      </footer>
    </div>
  );
}
