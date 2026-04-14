import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VxMicIcon, VxSendIcon } from '../../components/ui/icons/kinetic';
import { VxRadarIcon, VxMediaIcon, VxBackIcon } from '../../components/ui/icons/static';
import { useShield } from '../../context/ShieldContext';
import axios from 'axios';
import NetworkConfig from '../../services/NetworkConfig';

export default function MessageInput({ onSendMessage, isAI, disabled, activeContactPhone }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSend = () => {
    if (disabled) return;
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  // ─── AUDIO RECORDING LOGIC ────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setShowVoiceMenu(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Błąd dostępu do mikrofonu:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const { sessions, encryptFor } = useShield();

  const handleAntiVoiceAction = async (mode) => {
    if (!audioBlob || !activeContactPhone) return;
    setShowVoiceMenu(false);

    try {
      if (mode === 'voice') {
        if (!sessions[activeContactPhone]) {
          alert("🛡️ [SHIELD] Brak aktywnej zapadni. Nie można zabezpieczyć audio.");
          return;
        }

        // 1. Konwersja Blob -> ArrayBuffer -> Uint8Array
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioData = new Uint8Array(arrayBuffer);

        // 2. Szyfrowanie ShieldEngine
        const { header, ciphertext, nonce } = await encryptFor(activeContactPhone, audioData);

        // 3. Wysłanie zaszyfrowanego pliku
        const encryptedBlob = new Blob([Buffer.from(ciphertext, 'base64')], { type: 'application/octet-stream' });
        const formData = new FormData();
        formData.append('file', encryptedBlob, 'shield_voice.bin');

        const uploadRes = await axios.post(`${NetworkConfig.getSocketUrl()}/api/media/upload`, formData);
        
        if (uploadRes.data.url) {
          // Przekazujemy rozszerzone dane do ChatScreen
          onSendMessage(uploadRes.data.url, 'voice', recordingDuration, { header, nonce });
        }
      }
    } catch (e) {
      console.error("🛡️ [SHIELD] Web Voice Encryption Error:", e);
    }
    setAudioBlob(null);
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
            disabled={disabled}
            placeholder={disabled ? "WĘZEŁ ZABLOKOWANY" : (isAI ? "PRZETWARZANIE NEURALNE: ZAPYTAJ AI..." : "WPISZ WIADOMOŚĆ VEXTRO...")}
            className={`w-full bg-white/5 border rounded-2xl py-4 px-6 text-sm font-mono text-white placeholder:text-textMuted/40 focus:outline-none transition-all duration-300 pr-16 shadow-inner selection:bg-primary/40 ${disabled ? 'border-red-500/50 cursor-not-allowed opacity-50 bg-red-900/10' : 'border-white/10 focus:border-primary/40 focus:bg-white/[0.08]'}`}
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {!disabled && <span className="text-[10px] font-mono text-textMuted opacity-20">CTRL+ENTER</span>}
          </div>
        </div>

        {/* Przycisk Mikrofonu (Anti Voice) - PO LEWEJ od Send */}
        {!disabled && (
          <div className="relative">
            <AnimatePresence>
              {showVoiceMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-4 w-48 glass-panel-heavy border border-primary/30 p-2 z-50 rounded-2xl shadow-neon-primary/20"
                >
                  <button 
                    onClick={() => handleAntiVoiceAction('voice')}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 rounded-xl transition-colors text-white group"
                  >
                    <VxMediaIcon size={16} />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Voice-to-Voice</span>
                  </button>
                  <button 
                    onClick={() => { setShowVoiceMenu(false); setAudioBlob(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-white shadow-lg"
                  >
                    <VxBackIcon size={10} className="rotate-180" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-xl transition-all duration-300 flex items-center justify-center border ${
                isRecording 
                  ? 'bg-red-500/20 border-red-500 text-red-500 shadow-neon-red animate-pulse' 
                  : 'bg-white/5 border-white/10 text-textMuted hover:border-primary/40 hover:text-primary'
              }`}
            >
              <VxMicIcon size={20} state={isRecording ? 'recording' : 'idle'} />
              {isRecording && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded">
                  {recordingDuration}s
                </span>
              )}
            </motion.button>
          </div>
        )}

        {/* Przycisk Wysyłania */}
        <motion.button
          onClick={handleSend}
          disabled={disabled || isRecording}
          whileHover={!disabled ? { scale: 1.05, boxShadow: '0 0 20px rgba(191, 0, 255, 0.4)' } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          className={`${disabled ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-primary text-white shadow-neon-primary'} p-4 rounded-xl transition-all duration-300 flex items-center justify-center`}
        >
          <VxSendIcon size={20} />
        </motion.button>
      </div>
      
      {/* Dekoracyjne, hakerskie linie boczne */}
      <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
}
