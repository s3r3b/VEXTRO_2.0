import React from 'react';
import { motion } from 'framer-motion';

export default function ChatCanvas({ messages, myPhone }) {
  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* NAGŁÓWEK AKTYWNEGO KANAŁU */}
      <div className="p-6 border-b border-white/5 backdrop-blur-md bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-orbitron font-bold text-sm tracking-widest text-white">VEXTRO NEURAL AI</h3>
            <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] animate-pulse">Syncing Encrypted Packets...</p>
          </div>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono text-textMuted uppercase tabular-nums tracking-widest">UID: VX-992-00-X</span>
        </div>
      </div>

      {/* STRUMIEŃ WIADOMOŚCI */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        {messages.map((msg, idx) => {
          const isMine = msg.sender === myPhone;
          return (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, x: isMine ? 20 : -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`relative max-w-[70%] p-5 rounded-2xl glass-panel border transition-all duration-500 hover:shadow-neon-primary/20 ${
                  isMine 
                    ? 'bg-primary/10 border-primary/30 rounded-br-none shadow-neon-primary/10' 
                    : 'bg-white/5 border-white/10 rounded-bl-none shadow-black/40'
                }`}
              >
                {/* Cyberpunkowy detal - mikro pasek boczny */}
                <div className={`absolute top-0 bottom-0 w-1 ${isMine ? 'right-0 rounded-r-2xl bg-primary' : 'left-0 rounded-l-2xl bg-white/20'}`}></div>
                
                <p className="text-sm leading-relaxed text-white/90 selection:bg-primary/40">{msg.content}</p>
                
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/5 pt-2">
                  <span className="text-[9px] font-mono text-textMuted">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  </span>
                  {isMine && <span className="text-[9px] text-primary font-bold tracking-tighter">SECURED</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
