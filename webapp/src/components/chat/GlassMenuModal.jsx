import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VxGhostGate, VxPurgeIcon } from '../ui/icons/kinetic';
import { 
  VxContactCardIcon, 
  VxRadarIcon, 
  VxMediaIcon, 
  VxMuteIcon, 
  VxMoreIcon, 
  VxBackIcon, 
  VxSecurityIcon, 
  VxShortcutIcon 
} from '../ui/icons/static';

export default function GlassMenuModal({ isOpen, onClose, onAction, isMuted, isBlocked, isGhost }) {
  const [menuView, setMenuView] = useState('MAIN');

  const mainOptions = [
    { id: '1', label: 'Wyświetl kontakt', icon: VxContactCardIcon, danger: false, actionKey: 'VIEW_CONTACT' },
    { id: '2', label: 'Szukaj', icon: VxRadarIcon, danger: false, actionKey: 'SEARCH' },
    { id: '3', label: 'Multimedia, linki i dok...', icon: VxMediaIcon, danger: false, actionKey: 'MEDIA' },
    { id: '4', label: isMuted ? 'Odwisz powiadomienia' : 'Wycisz powiadomienia', icon: VxMuteIcon, danger: false, actionKey: 'TOGGLE_MUTE' },
    { id: '5', label: isGhost ? 'OFF GHOST MODE' : 'GHOST MODE', icon: VxGhostGate, danger: false, highlight: true, actionKey: 'TOGGLE_GHOST' },
    { id: '6', label: 'Więcej', icon: VxMoreIcon, danger: false, action: () => setMenuView('MORE') },
  ];

  const moreOptions = [
    { id: '7', label: 'Wróć', icon: VxBackIcon, danger: false, action: () => setMenuView('MAIN') },
    { id: '8', label: isBlocked ? 'Odblokuj' : 'Zablokuj', icon: VxSecurityIcon, danger: true, actionKey: 'TOGGLE_BLOCK' },
    { id: '9', label: 'Wyczyść czat', icon: VxPurgeIcon, danger: true, actionKey: 'CLEAR_CHAT' },
    { id: '10', label: 'Dodaj skrót', icon: VxShortcutIcon, danger: false, actionKey: 'ADD_SHORTCUT' },
  ];

  const currentOptions = menuView === 'MAIN' ? mainOptions : moreOptions;

  const handlePress = (opt) => {
    if (opt.action) {
      opt.action();
    } else if (opt.actionKey) {
      onAction && onAction(opt.actionKey);
      setMenuView('MAIN');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Niewidzialna warstwa wyłapująca kliknięcia w inne części ekranu */}
      <div 
        className="fixed inset-0 z-40"
        onClick={() => {
           setMenuView('MAIN');
           onClose();
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div 
          key={menuView}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[80px] right-6 z-50 w-64 bg-[#0a0f18]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <div className="flex flex-col p-2">
            {currentOptions.map((opt) => {
              const IconComponent = opt.icon;
              const isDanger = opt.danger;
              const isHighlight = opt.highlight;
              
              let textColorClass = "text-white/90";
              let hoverClass = "hover:bg-white/5";
              let iconColor = "currentColor";

              if (isDanger) {
                 textColorClass = "text-red-400";
                 hoverClass = "hover:bg-red-500/10";
              } else if (isHighlight) {
                 textColorClass = "text-primary drop-shadow-[0_0_8px_rgba(191,0,255,0.6)]";
                 hoverClass = "hover:bg-primary/10";
                 iconColor = "currentColor";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handlePress(opt)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-sans tracking-wide rounded-xl transition-colors duration-200 ${textColorClass} ${hoverClass}`}
                >
                  <span className={isHighlight ? "font-bold" : "font-medium"}>{opt.label}</span>
                  <IconComponent size={18} color={isDanger ? '#f87171' : (isHighlight ? 'var(--color-primary)' : 'var(--color-primary)')} state={isHighlight && isGhost ? 'active' : 'idle'} />
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
