import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VxVaultHandle } from '../../components/ui/icons/kinetic';
import { VxSecurityIcon, VxMediaIcon, VxNeuralIcon, VxAvatarIcon } from '../../components/ui/icons/static';
import GlassMenuModal from './GlassMenuModal';
import { useShield } from '../../context/ShieldContext';
import axios from 'axios';
import NetworkConfig from '../../services/NetworkConfig';

export default function ChatCanvas({ messages, myPhone, activeContact, onMenuAction, isMuted, isBlocked, isGhost, onToggleTerminal }) {
  const scrollContainerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { decryptFrom } = useShield();

  const [playingId, setPlayingId] = useState(null);
  const [audioUrls, setAudioUrls] = useState({}); // { msgId: blobUrl }

  const handlePlayVoice = async (msg) => {
    if (playingId === msg.id) {
      setPlayingId(null);
      return;
    }

    try {
      let audioUrl = audioUrls[msg.id];

      if (!audioUrl) {
        console.log(`🛡️ [SHIELD] Web JIT Decryption: ${msg.id}`);
        // 1. Pobierz zaszyfrowany plik
        const res = await axios.get(`${NetworkConfig.getSocketUrl()}${msg.mediaUrl}`, {
          responseType: 'arraybuffer'
        });

        // 2. Deszyfrowanie binarne
        const encryptedData = new Uint8Array(res.data);
        const decryptedData = await decryptFrom(activeContact.contactPhone, msg.header, encryptedData, msg.nonce, true);

        // 3. Stwórz Blob URL dla przeglądarki
        const blob = new Blob([decryptedData], { type: 'audio/webm' }); // WebApp używa WebM
        audioUrl = URL.createObjectURL(blob);
        setAudioUrls(prev => ({ ...prev, [msg.id]: audioUrl }));
      }

      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingId(msg.id);
      audio.onended = () => setPlayingId(null);

    } catch (err) {
      console.error("🛡️ [SHIELD] Web Playback Error:", err);
      alert("Błąd deszyfrowania notatki głosowej.");
    }
  };

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
                    <button 
                      onClick={() => handlePlayVoice(msg)}
                      className={`p-3 rounded-full ${playingId === msg.id ? 'bg-accent/20 text-accent animate-pulse shadow-neon-accent/40' : (isMine ? 'bg-primary/20 text-primary' : 'bg-white/10 text-textMuted')} hover:scale-110 transition-all`}
                    >
                      <VxMediaIcon size={20} />
                    </button>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <div className={`absolute left-0 top-0 bottom-0 ${playingId === msg.id ? 'w-full transition-all duration-[2000ms] linear bg-accent shadow-neon-accent' : (isMine ? 'w-1/3 bg-primary shadow-neon-primary' : 'w-1/3 bg-white/20')}`}></div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-mono text-textMuted uppercase tracking-widest">
                          {playingId === msg.id ? 'DECRYPTING & PLAYING' : 'SECURE_VOICE.BIN'}
                        </span>
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
