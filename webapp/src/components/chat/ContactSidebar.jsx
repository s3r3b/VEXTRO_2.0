import React from 'react';
import { motion } from 'framer-motion';

const CONTACTS = [
  { id: 'ai', name: 'VEXTRO AI', sub: 'Neural Network Active', icon: '🤖', active: true, color: '#B026FF' },
  { id: '1', name: 'Operator 01', sub: 'E2E Session Active', icon: '👥', active: false, color: '#00f0ff' },
  { id: '2', name: 'Klaudiusz', sub: 'Lead Architect', icon: '💎', active: false, color: '#00f0ff' },
  { id: '3', name: 'Security Bot', sub: 'Scan Complete', icon: '🛡️', active: false, color: '#00f0ff' },
];

export default function ContactSidebar() {
  return (
    <motion.aside 
      className="w-80 glass-panel flex flex-col h-full border border-white/5 relative overflow-hidden shrink-0"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-xs tracking-[0.3em] text-textMuted uppercase opacity-60">Session Registry</h2>
        <div className="w-2 h-2 rounded-full bg-primary shadow-neon-primary animate-pulse"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {CONTACTS.map((contact, idx) => (
          <motion.div
            key={contact.id}
            className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-white/10 ${contact.active ? 'bg-white/5 border-primary/20 shadow-lg shadow-black/40' : 'hover:bg-white/[0.03]'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: contact.color, backgroundColor: `${contact.color}10` }}
              >
                <span className="text-xl">{contact.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <TextGlowing text={contact.name} active={contact.active} />
                <p className="text-[10px] font-mono text-textMuted truncate uppercase tracking-widest mt-1">{contact.sub}</p>
              </div>
              {contact.active && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              )}
            </div>
            
            {contact.active && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent rounded-xl"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-black/20 mt-auto border-t border-white/5">
        <button className="w-full py-3 px-4 rounded-lg bg-surface border border-surfaceBorder text-[10px] font-mono text-primary tracking-[0.2em] uppercase hover:bg-primary/10 hover:border-primary/40 transition-all duration-300">
          + Inicjuj Nowy Kanał
        </button>
      </div>
    </motion.aside>
  );
}

function TextGlowing({ text, active }) {
  return (
    <span className={`block font-bold text-sm tracking-wide transition-colors ${active ? 'text-primary' : 'text-white/80 group-hover:text-white'}`}>
      {text}
    </span>
  );
}
