import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VxVaultHandle } from '../ui/icons/kinetic';
import { VxSecurityIcon, VxMediaIcon, VxNeuralIcon, VxAvatarIcon } from '../ui/icons/static';
import GlassMenuModal from './GlassMenuModal';

export default function ChatCanvas({ messages, myPhone, activeContact, onMenuAction, isMuted, isBlocked, isGhost, onToggleTerminal }) {
  const scrollContainerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Wymuszenie precyzyjnego poślizgu tylko dla wewnętrznego kontenera
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth' // przegladarka przetworzy to lokalnie na kontener
      });
    }
  }, [messages]);
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* NAGŁÓWEK AKTYWNEGO KANAŁU */}
      <div className="p-6 border-b border-white/5 backdrop-blur-md bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xl">
            {activeContact?.isGroup ? <VxSecurityIcon size={24} /> : (activeContact?.isAI ? <VxNeuralIcon size={24} /> : <VxAvatarIcon size={24} />)}
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-sm tracking-widest text-white uppercase">
              {activeContact?.groupName || activeContact?.displayName || 'VEXTRO NEURAL AI'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
               <VxSecurityIcon size={12} color="var(--color-accent)" />
               <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] animate-pulse">E2EE SECURE CHANNEL</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-[10px] font-mono text-textMuted uppercase tabular-nums tracking-widest">
              {activeContact?.isGroup ? `MEMBERS: ${activeContact?.members?.length || 0}` : `UID: ${activeContact?.contactPhone || 'VX-992-00'}`}
            </span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
             <VxVaultHandle size={24} state={isMenuOpen ? 'open' : 'idle'} />
          </button>
          
          {myPhone === '+48798884532' && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-white/20 neon-glow-primary animate-pulse">
              <VxNeuralIcon size={20} />
              <span className="text-[9px] font-mono font-bold text-primary tracking-widest hidden lg:block">GOD MODE ACTIVE</span>
            </div>
          )}
        </div>
      </div>
      
      <GlassMenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onAction={onMenuAction}
        isMuted={isMuted}
        isBlocked={isBlocked}
        isGhost={isGhost}
      />

      {/* STRUMIEŃ WIADOMOŚCI */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide flex flex-col"
      >
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
                
                {msg.type === 'voice' ? (
                  <div className="flex items-center gap-4 py-2 min-w-[240px]">
                    <button className={`p-3 rounded-full ${isMine ? 'bg-primary/20 text-primary' : 'bg-white/10 text-textMuted'} hover:scale-110 transition-transform`}>
                      <VxMediaIcon size={20} />
                    </button>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1/3 ${isMine ? 'bg-primary shadow-neon-primary' : 'bg-accent shadow-neon-accent'}`}></div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-mono text-textMuted uppercase">SHIELDED_AUDIO.BIN</span>
                        <span className="text-[9px] font-mono text-white/50">{msg.duration || 0}s</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-white/90 selection:bg-primary/40 whitespace-pre-wrap">{msg.content}</p>
                )}
                
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
