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
import SettingsModal from '../components/ui/SettingsModal';
import HologramProfileModal from '../components/chat/HologramProfileModal';
import { useShield } from '../context/ShieldContext';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [myPhone, setMyPhone] = useState(() => localStorage.getItem('userPhone') || 'WEB_USER');
  const [isAI, setIsAI] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeContact, setActiveContact] = useState({ contactPhone: 'AI', displayName: 'VEXTRO AI', isAI: true });
  const [isShieldReady, setIsShieldReady] = useState(false);
  const socketRef = useRef(null);

  const isBlocked = activeContact?.isBlocked || false;
  const isMuted = activeContact?.isMuted || false;

  const { sessions, groupKeys, startSession, encryptFor, decryptFrom, setupGroupSession, encryptForGroup, decryptFromGroup } = useShield();

  useEffect(() => {
    // 1. Zabezpieczenia Krypto dla aktywnego kontekstu
    const initShieldContext = async () => {
      if (isAI || !activeContact) return;
      setIsShieldReady(false);

      if (activeContact.isGroup && !groupKeys[activeContact._id]) {
        try {
          const arr = activeContact.members || [];
          const me = arr.find(m => m.phone === myPhone);
          if (me) {
             const adminUser = await axios.get(`${NetworkConfig.BASE_URL}/api/users/${activeContact.adminPhone}`).then(r => r.data.user);
             if (adminUser) setupGroupSession(activeContact._id, me.encryptedKey, me.nonce || 'EMPTY', adminUser.publicKey);
          }
        } catch(e) { console.warn("Shield Init Error:", e); }
      } else if (!activeContact.isGroup && activeContact.publicKey && !sessions[activeContact.contactPhone]) {
         try {
           const myPriv = localStorage.getItem('vextro_identity_private');
           const nacl = await import('tweetnacl');
           const { Buffer } = await import('buffer');
           const secret = nacl.default.box.before(
             Buffer.from(activeContact.publicKey, 'base64'),
             Buffer.from(myPriv, 'base64')
           );
           await startSession(activeContact.contactPhone, activeContact.publicKey, secret);
         } catch(e) {}
      }
      setIsShieldReady(true);
    };

    initShieldContext();

    // 2. Inicjalizacja Połączenia VEXTRO
    const socket = io(NetworkConfig.getSocketUrl(), { 
        transports: ['websocket'],
        extraHeaders: { 'bypass-tunnel-reminder': 'true' }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('📡 VEXTRO Web Terminal: PROTOCOL ESTABLISHED');
      if (!isAI && activeContact) {
        const roomId = activeContact.isGroup 
          ? activeContact._id 
          : [myPhone, activeContact.contactPhone].sort().join('-');
        socket.emit('join_room', { roomId });
      }
    });

    // 3. Odbieranie i deszyfrowanie
    socket.on('receive_message', async (data) => {
      if (data.isEncrypted && !isAI && sessions[activeContact.contactPhone]) {
         try {
           const d = await decryptFrom(activeContact.contactPhone, data.header, data.content, data.nonce);
           setMessages(prev => [...prev, { ...data, content: d }]);
         } catch(e) { setMessages(prev => [...prev, { ...data, content: '[ZABLOKOWANE]' }]); }
      } else {
         setMessages(prev => [...prev, data]);
      }
    });

    socket.on('receive_group_message', (data) => {
      if (data.isEncrypted && data.sender !== myPhone) {
        try {
           const d = decryptFromGroup(activeContact._id, data.content, data.nonce);
           setMessages(prev => [...prev, { ...data, content: d }]);
        } catch(e) { setMessages(prev => [...prev, { ...data, content: '[ZABLOKOWANE]' }]); }
      } else if (!data.isEncrypted) {
         setMessages(prev => [...prev, data]);
      }
    });

    return () => socket.disconnect();
  }, [activeContact, isAI, myPhone, sessions, groupKeys]);

  const handleSendMessage = async (text, type = 'text', duration = 0) => {
    if (!text && type === 'text') return;
    const timestamp = new Date().toISOString();
    
    if (isAI) {
      // --- LOGIKA AI (Mock/Proxy) ---
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
      // --- LOGIKA CZATU P2P & GROUP ---
      const roomId = activeContact.isGroup 
          ? activeContact._id 
          : [myPhone, activeContact.contactPhone].sort().join('-');
            let msgPayload = { 
         sender: myPhone, 
         roomId, 
         content: text, 
         type, 
         duration,
         timestamp 
       };

      try {
        if (activeContact.isGroup && groupKeys[activeContact._id]) {
           const { ciphertext, nonce } = encryptForGroup(activeContact._id, text);
           msgPayload = { ...msgPayload, content: ciphertext, nonce, isEncrypted: true };
           socketRef.current.emit('send_group_message', msgPayload);
        } else if (!activeContact.isGroup && sessions[activeContact.contactPhone]) {
           const { header, ciphertext, nonce } = await encryptFor(activeContact.contactPhone, text);
           msgPayload = { ...msgPayload, content: ciphertext, header, nonce, isEncrypted: true };
           socketRef.current.emit('send_message', msgPayload);
        } else {
           socketRef.current.emit('send_message', msgPayload);
        }
      } catch (err) {
        console.error("Encryption fail:", err);
      }
      
      setMessages(prev => [...prev, { ...msgPayload, content: text }]);
    }
  };

  const handleMenuAction = async (actionKey) => {
    switch(actionKey) {
      case 'VIEW_CONTACT':
        setIsProfileOpen(true);
        break;
      case 'SEARCH':
      case 'MEDIA':
        alert('Moduł zablokowany/W budowie.');
        break;
      case 'TOGGLE_MUTE':
        if (!activeContact?.isGroup) {
          try {
            const newMuted = !isMuted;
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/status`, {
              ownerPhone: myPhone,
              contactPhone: activeContact.contactPhone,
              isMuted: newMuted
            });
            setActiveContact(prev => ({...prev, isMuted: newMuted}));
          } catch(e) {}
        }
        break;
      case 'TOGGLE_GHOST':
        setIsGhostMode(prev => !prev);
        break;
      case 'TOGGLE_BLOCK':
        if (!activeContact?.isGroup) {
          try {
             const newBlocked = !isBlocked;
             await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/status`, {
               ownerPhone: myPhone,
               contactPhone: activeContact.contactPhone,
               isBlocked: newBlocked
             });
             setActiveContact(prev => ({...prev, isBlocked: newBlocked}));
          } catch(e) {}
        }
        break;
      case 'CLEAR_CHAT':
        try {
           const roomId = activeContact?.isGroup ? activeContact._id : [myPhone, activeContact.contactPhone].sort().join('-');
           await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages/${roomId}`);
           setMessages([]);
        } catch(e) {}
        break;
      case 'ADD_SHORTCUT':
        alert('Przeglądarka WebApp nie wspiera natywnych skrótów ekranu bez PWA manifestu.');
        break;
    }
  };

  // Ghost Mode cleanup (przelączenie kontaktu)
  useEffect(() => {
     if (isGhostMode) {
       console.log("👻 Przechwycono zamknięcie pokoju Ghost Mode (Web).");
     }
  }, [activeContact, isGhostMode]);

  return (
    <DashboardLayout>
      {/* 1. LEWA KOLUMNA: REGISTRY */}
      <ContactSidebar
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeContactPhone={activeContact?.contactPhone}
        onSelectContact={(contact) => {
          setActiveContact(contact);
          setIsAI(contact.isAI || false);
          setMessages([]);
        }}
      />

      {/* 2. ŚRODKOWA KOLUMNA: MAIN CANVAS */}
      <div className="flex-1 flex flex-col glass-panel border border-white/5 relative overflow-hidden">
        <ChatCanvas 
          messages={messages} 
          myPhone={myPhone} 
          activeContact={activeContact}
          onMenuAction={handleMenuAction}
          isMuted={isMuted}
          isBlocked={isBlocked}
          isGhost={isGhostMode}
        />
        <MessageInput onSendMessage={handleSendMessage} isAI={isAI} disabled={isBlocked && !activeContact?.isGroup} />
      </div>

      {/* 3. PRAWA KOLUMNA: MONITOR (KLASYCZNY) */}
      <TerminalPanel />

      {/* SETTINGS OVERLAY */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* HOLOGRAM PROFILE OVERLAY */}
      <HologramProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        data={{
          title: activeContact?.groupName || activeContact?.displayName || 'VEXTRO NODE',
          phoneNumber: activeContact?.isGroup ? activeContact._id : activeContact?.contactPhone,
          remotePublicKey: activeContact?.isGroup ? activeContact._id : activeContact?.publicKey,
          isGroup: activeContact?.isGroup || false
        }}
        onAction={handleMenuAction}
        isMuted={isMuted}
        isBlocked={isBlocked}
      />
    </DashboardLayout>
  );
}
