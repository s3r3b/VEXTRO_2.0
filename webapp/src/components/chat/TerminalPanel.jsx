import React from 'react';
import { motion } from 'framer-motion';

export default function TerminalPanel() {
  const stats = [
    { label: 'E2EE STATUS', value: 'VERIFIED', color: 'text-primary' },
    { label: 'SIGNAL STRENGTH', value: '98%', color: 'text-white' },
    { label: 'LATENCY', value: '24ms', color: 'text-white' },
    { label: 'AI NEURAL LOAD', value: 'Low', color: 'text-primary' },
  ];

  return (
    <motion.div 
      className="w-72 glass-panel hidden lg:flex flex-col h-full border border-white/5 relative overflow-hidden shrink-0"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="p-6 border-b border-white/5 bg-black/20">
        <h2 className="font-orbitron font-bold text-xs tracking-[0.3em] text-textMuted uppercase opacity-60">System Monitor</h2>
      </div>

      {/* STATYSTYKI SESJI */}
      <div className="p-6 space-y-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-[9px] font-mono text-textMuted uppercase tracking-widest">{stat.label}</span>
            <span className={`text-[10px] font-mono font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* MINI LOGI TERMINALOWE */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="h-full bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[9px] space-y-2 overflow-y-auto scrollbar-hide">
          <p className="text-primary opacity-60">READY FOR PACKET TRANSMISSION...</p>
          <p className="text-white/40">[{new Date().toLocaleTimeString()}] Establishing E2EE tunnel...</p>
          <p className="text-white/40">[{new Date().toLocaleTimeString()}] Handshake successful (V7.12)</p>
          <p className="text-primary opacity-80">CONNECTED: VX-992-SESSION</p>
          <p className="text-white/20">Waiting for user input...</p>
          {/* Symulacja spływających logów */}
          <motion.p 
            animate={{ opacity: [1, 0, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-primary"
          >
            _
          </motion.p>
        </div>
      </div>

      {/* DOLNA DEKORACJA - SCANLINE */}
      <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
    </motion.div>
  );
}
