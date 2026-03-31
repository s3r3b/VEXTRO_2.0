import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import NetworkConfig from '../services/NetworkConfig';

// LAYOUT & COMPONENTS
import DashboardLayout from '../components/layout/DashboardLayout';
import ContactSidebar from '../components/chat/ContactSidebar';
import ChatCanvas from '../components/chat/ChatCanvas';
import MessageInput from '../components/chat/MessageInput';
import TerminalPanel from '../components/chat/TerminalPanel';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [myPhone, setMyPhone] = useState('WEB_USER'); // Domyślny identyfikator sesji webowej
  const [isAI, setIsAI] = useState(true); // Na razie domyślnie tryb AI dla demonstracji Masterpiece
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Inicjalizacja Połączenia VEXTRO
    const socket = io(NetworkConfig.getSocketUrl(), { 
        transports: ['websocket'],
        extraHeaders: {
            'bypass-tunnel-reminder': 'true'
        }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('📡 VEXTRO Web Terminal: PROTOCOL ESTABLISHED');
    });

    // 2. Obsługa Historii i Nowych Wiadomości
    socket.on('chat_history', (history) => {
      setMessages(history.map(m => ({ ...m, id: m._id || Math.random() })));
    });

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, { ...data, id: Date.now() }]);
    });

    return () => socket.disconnect();
  }, []);

  const handleSendMessage = async (text) => {
    const timestamp = new Date().toISOString();
    
    if (isAI) {
      // --- LOGIKA AI (VEXTRO NEURAL) ---
      const userMsg = { sender: myPhone, content: text, timestamp };
      setMessages(prev => [...prev, userMsg]);

      try {
        const apiKey = localStorage.getItem('ai_api_key');
        if (!apiKey) {
           throw new Error('MISSING_API_KEY: Inicjalizuj klucz w ustawieniach terminala.');
        }

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: text }],
          },
          {
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
          }
        );

        const aiReply = response.data.choices[0].message.content;
        setMessages(prev => [...prev, { sender: 'AI', content: aiReply, timestamp: new Date().toISOString() }]);
      } catch (err) {
        setMessages(prev => [...prev, { 
          sender: 'AI', 
          content: `⚠️ SYSTEM_ERR: ${err.message}`, 
          timestamp: new Date().toISOString() 
        }]);
      }
    } else {
      // --- LOGIKA CZATU P2P ---
      const msgPayload = { sender: myPhone, content: text, timestamp };
      socketRef.current.emit('send_message', msgPayload);
      setMessages(prev => [...prev, msgPayload]);
    }
  };

  return (
    <DashboardLayout>
      {/* 1. LEWA KOLUMNA: REGISTRY */}
      <ContactSidebar />

      {/* 2. ŚRODKOWA KOLUMNA: MAIN CANVAS */}
      <div className="flex-1 flex flex-col glass-panel border border-white/5 relative overflow-hidden">
        <ChatCanvas messages={messages} myPhone={myPhone} />
        <MessageInput onSendMessage={handleSendMessage} isAI={isAI} />
      </div>

      {/* 3. PRAWA KOLUMNA: MONITOR */}
      <TerminalPanel />
    </DashboardLayout>
  );
}
