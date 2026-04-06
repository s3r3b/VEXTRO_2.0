import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VxGearIcon, VxPurgeIcon, VxSendIcon } from '../ui/icons/kinetic';
import { VxNeuralIcon } from '../ui/icons/static';
import { io } from 'socket.io-client';
import NetworkConfig from '../../services/NetworkConfig';

export default function TerminalPanel() {
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll logic (Stick-to-bottom)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    const adminPhone = '+48798884532';
    
    if (phone === adminPhone) {
      setIsAdmin(true);
      const newSocket = io(NetworkConfig.getSocketUrl());

      newSocket.on('connect', () => {
        setLogs(prev => [...prev, { type: 'system', text: '📡 [CONNECTED] VEXTRO_WEB_GOD_MODE' }]);
        newSocket.emit('request_terminal', { phoneNumber: phone });
      });

      newSocket.on('terminal_output', (data) => {
        setLogs(prev => [...prev, { type: 'output', text: data }]);
      });

      newSocket.on('terminal_error', (data) => {
        setLogs(prev => [...prev, { type: 'error', text: `🛑 [AUTH_ERROR] ${data.error}` }]);
      });

      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, []);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('terminal_input', input + '\n');
    setInput('');
  };

  if (!isAdmin) {
    return (
      <motion.div 
        className="w-72 glass-panel hidden lg:flex flex-col h-full border border-white/5 relative overflow-hidden shrink-0"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="p-6 border-b border-white/5 bg-black/20">
          <h2 className="font-orbitron font-bold text-xs tracking-[0.3em] text-textMuted uppercase opacity-60">System Monitor</h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 opacity-50">
             <span className="text-[9px] font-mono text-textMuted uppercase tracking-widest">ENCRYPTION</span>
             <span className="text-[10px] font-mono font-bold text-primary">SHIELD_ACTIVE</span>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-80 glass-panel hidden lg:flex flex-col h-full border border-white/10 relative overflow-hidden shrink-0 bg-black/20"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      {/* HEADER */}
      <div className="p-5 border-b border-white/10 bg-black/40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <VxGearIcon size={16} state="idle" />
          </div>
          <span className="font-orbitron font-bold text-[11px] tracking-[0.3em] text-white">VEXTRO_SHELL</span>
        </div>
        <button 
          onClick={() => setLogs([])}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-textMuted hover:text-red-400"
        >
          <VxPurgeIcon size={14} />
        </button>
      </div>

      {/* LOGI TERMINALOWE */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[10px] overflow-y-auto bg-black/40 scrollbar-thin scrollbar-thumb-primary/10"
      >
        {logs.map((log, i) => (
          <div 
            key={i} 
            className={`mb-1 leading-relaxed ${
              log.type === 'system' ? 'text-accent' : 
              log.type === 'error' ? 'text-red-500' : 
              'text-primary/90'
            }`}
          >
            <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <span className="text-primary mr-2 font-bold">{'>'}</span>
            {log.text}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center opacity-20 flex-col gap-2">
            <VxNeuralIcon size={48} />
            <span className="text-[9px] tracking-[0.5em] uppercase font-bold">Terminal Ready</span>
          </div>
        )}
      </div>

      {/* INPUT COMMAND */}
      <div className="p-4 border-t border-white/5 bg-black/60">
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-4 bg-white/5 p-2 px-4 rounded-xl border border-white/5 focus-within:border-primary/20 transition-all"
        >
          <span className="text-primary font-bold font-mono tracking-widest">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="EXEC_COMMAND..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[11px] placeholder:text-white/10 tracking-wider"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" className="p-2 hover:bg-primary/10 rounded-lg text-primary">
            <VxSendIcon size={14} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
