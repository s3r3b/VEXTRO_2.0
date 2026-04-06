import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VxPurgeIcon } from '../ui/icons/kinetic';
import { 
  VxBackIcon, 
  VxSecurityIcon, 
  VxProfileIcon, 
  VxMuteIcon, 
  VxNeuralIcon,
  VxRadarIcon,
  VxContactCardIcon,
  VxInterfaceIcon
} from '../ui/icons/static';

export default function HologramProfileModal({ isOpen, onClose, data, onAction, isMuted, isBlocked }) {
  if (!data) return null;

  const { title, phoneNumber, remotePublicKey, isGroup } = data;

  const formatFingerprint = (key) => {
    if (!key) return "WĘZEŁ NIEWIDOCZNY";
    const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const blocks = [];
    for (let i = 0; i < cleanKey.length && blocks.length < 8; i += 4) {
      blocks.push(cleanKey.substring(i, i + 4));
    }
    return blocks.join(' - ');
  };

  const fingerprint = formatFingerprint(remotePublicKey);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#0a0f18]/90 border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10"
              >
                <VxBackIcon size={24} className="rotate-180" />
              </button>

              <div className="p-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(191,0,255,0.2)]">
                      {isGroup ? (
                        <VxSecurityIcon size={40} />
                      ) : (
                        <VxProfileIcon size={40} />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 rounded-full p-2">
                       <VxSecurityIcon size={16} color="var(--color-accent)" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase mb-2">
                    {title}
                  </h2>
                  <p className="text-[10px] font-mono text-textMuted uppercase tracking-[0.3em] mb-4">
                    {isGroup ? "SECURED GROUP NODE" : (phoneNumber === 'AI' ? "AI NEURAL LINK" : `UID: ${phoneNumber}`)}
                  </p>
                  
                  <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                    <VxContactCardIcon size={12} color="var(--color-accent)" />
                    <span className="text-[9px] font-bold text-accent uppercase tracking-wider">VEXTRO SHIELD ENCRYPTED</span>
                  </div>
                </div>

                {/* Fingerprint Section */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <VxRadarIcon size={18} />
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Klucz Kryptograficzny</span>
                  </div>
                  <div className="font-mono text-xs text-white/80 text-center break-all leading-relaxed mb-4">
                    {fingerprint}
                  </div>
                  <p className="text-[9px] text-textMuted text-center leading-relaxed italic">
                    Unikalny identyfikator sesji. Potwierdź ten kod z rozmówcą, aby wyeliminować wektor ataku typu MITM.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <button 
                    onClick={() => onAction('TOGGLE_MUTE')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${isMuted ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-textMuted hover:bg-white/10'}`}
                  >
                    <VxMuteIcon size={18} />
                    <span className="text-[9px] font-bold uppercase">{isMuted ? 'Odwisz' : 'Wycisz'}</span>
                  </button>

                  <button 
                    onClick={() => onAction('TOGGLE_BLOCK')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${isBlocked ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-white/5 border-white/10 text-textMuted hover:bg-white/10'}`}
                  >
                    <VxSecurityIcon size={18} color="#ef4444" />
                    <span className="text-[9px] font-bold uppercase">{isBlocked ? 'Odblokuj' : 'Blokuj'}</span>
                  </button>

                  <button 
                    onClick={() => onAction('CLEAR_CHAT')}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300"
                  >
                    <VxPurgeIcon size={18} />
                    <span className="text-[9px] font-bold uppercase text-red-400">Czyść</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 opacity-50">
                   <VxInterfaceIcon size={12} color="rgba(255,255,255,0.4)" />
                   <span className="text-[8px] font-mono text-textMuted uppercase tracking-widest">Protocol Shield v4.5 active</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
