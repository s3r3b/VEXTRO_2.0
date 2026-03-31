import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function MessageInput({ onSendMessage, isAI }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <div className="p-8 bg-black/40 backdrop-blur-xl border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto flex items-center gap-4 relative">
        {/* Wskaźnik Szyfrowania (Pulse) */}
        <div className="flex flex-col items-center justify-center gap-1 group">
          <motion.div 
            className="w-3 h-3 rounded-full bg-primary"
            animate={{ 
              scale: text.length > 0 ? [1, 1.4, 1] : 1,
              opacity: text.length > 0 ? [1, 0.5, 1] : 0.4
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span className="text-[8px] font-mono text-textMuted uppercase group-hover:text-primary transition-colors">SEC</span>
        </div>

        {/* Główne Pole Inputu */}
        <div className="flex-1 relative group">
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isAI ? "PRZETWARZANIE NEURALNE: ZAPYTAJ AI..." : "WPISZ WIADOMOŚĆ VEXTRO..."}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-mono text-white placeholder:text-textMuted/40 focus:outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all duration-300 pr-16 shadow-inner selection:bg-primary/40"
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[10px] font-mono text-textMuted opacity-20">CTRL+ENTER</span>
          </div>
        </div>

        {/* Przycisk Wysyłania */}
        <motion.button
          onClick={handleSend}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(191, 0, 255, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary p-4 rounded-xl text-white shadow-neon-primary transition-all duration-300 flex items-center justify-center"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </motion.button>
      </div>
      
      {/* Dekoracyjne, hakerskie linie boczne */}
      <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
}
