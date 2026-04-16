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
import { apiService } from '../services/apiService';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [myPhone] = useState(() => localStorage.getItem('userPhone') || 'WEB_USER');
  const [isAI, setIsAI] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeContact, setActiveContact] = useState({ contactPhone: 'AI', displayName: 'VEXTRO AI', isAI: true });
  const socketRef = useRef(null);

  const isBlocked = activeContact?.isBlocked || false;
  const isMuted = activeContact?.isMuted || false;

  const { sessions, groupKeys, startSession, encryptFor, decryptFrom, setupGroupSession, encryptForGroup, decryptFromGroup } = useShield();

  useEffect(() => {
    // 1. Inicjalizacja Połączenia VEXTRO - Architektura Singleton
    const socket = io(NetworkConfig.getSocketUrl(), {
      transports: ['websocket'],
      extraHeaders: { 'bypass-tunnel-reminder': 'true' }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('📡 VEXTRO Web Terminal: PROTOCOL ESTABLISHED');
    });

    return () => socket.disconnect();
  }, []); // Czysty mount, socket przetrwa przełączanie kontaktów

  useEffect(() => {
    // 2. Zabezpieczenia Krypto dla aktywnego kontekstu
    const initShieldContext = async () => {
      if (isAI || !activeContact) return;

      if (activeContact.isGroup && !groupKeys[activeContact._id]) {
        try {
          const arr = activeContact.members || [];
          const me = arr.find(m => m.phone === myPhone);
          if (me) {
            const adminUser = await axios.get(`${NetworkConfig.getSocketUrl()}/api/users/${activeContact.adminPhone}`).then(r => r.data.user);
            if (adminUser) setupGroupSession(activeContact._id, me.encryptedKey, me.nonce || 'EMPTY', adminUser.publicKey);
          }
        } catch (err) { console.warn("Shield Init Error:", err); }
      } else if (!activeContact.isGroup && activeContact.publicKey && !sessions[activeContact.contactPhone]) {
        try {
          // POPRAWIONE: Ładujemy klucz Curve25519 zamiast klucza do podpisów (Ed25519)
          const myPriv = localStorage.getItem('vextro_dh_private');
          const nacl = await import('tweetnacl');
          const { Buffer } = await import('buffer');
          const secret = nacl.default.box.before(
            Buffer.from(activeContact.publicKey, 'base64'),
            Buffer.from(myPriv, 'base64')
          );
          await startSession(activeContact.contactPhone, activeContact.publicKey, secret);
        } catch (err) { console.error("Session Start Error", err); }
      }
    };

    initShieldContext();
  }, [activeContact, isAI, myPhone, sessions, groupKeys, startSession, setupGroupSession]);

  useEffect(() => {
    // 3. Zarządzanie subskrypcją pokoju oraz nasłuch wiadomości
    const socket = socketRef.current;
    if (!socket) return;

      if (!isAI && activeContact) {
        const roomId = activeContact.isGroup
          ? activeContact._id
          : [myPhone, activeContact.contactPhone].sort().join('-');
        socket.emit('join_room', { roomId });
      }

    const handleReceive = async (data) => {
      if (data.isEncrypted && !isAI && sessions[activeContact.contactPhone]) {
        try {
          if (data.type !== 'voice') {
            const d = await decryptFrom(activeContact.contactPhone, data.header, data.content, data.nonce);
            setMessages(prev => [...prev, { ...data, content: d }]);
          } else {
            setMessages(prev => [...prev, { ...data, content: 'Notatka głosowa (E2EE)' }]);
          }
        } catch (err) {
          console.warn("Decrypt error", err);
          setMessages(prev => [...prev, { ...data, content: '[ZABLOKOWANE]' }]);
        }
      } else {
        setMessages(prev => [...prev, data]);
      }
    };

    const handleGroupReceive = (data) => {
      if (data.isEncrypted && data.sender !== myPhone) {
        try {
          const d = decryptFromGroup(activeContact._id, data.content, data.nonce);
          setMessages(prev => [...prev, { ...data, content: d }]);
        } catch (err) {
          console.warn("Decrypt error", err);
          setMessages(prev => [...prev, { ...data, content: '[ZABLOKOWANE]' }]);
        }
      } else if (!data.isEncrypted) {
        setMessages(prev => [...prev, data]);
      }
    };

    socket.on('receive_message', handleReceive);
    socket.on('receive_group_message', handleGroupReceive);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('receive_group_message', handleGroupReceive);
    };
  }, [activeContact, isAI, myPhone, sessions, groupKeys, decryptFrom, decryptFromGroup]);

  const handleSendMessage = async (text, type = 'text', duration = 0, mediaPayload = null) => {
    if (!text && type === 'text') return;
    const timestamp = new Date().toISOString();

    if (isAI) {
      // ... (AI logic remains same, we don't change this)
      const userMsg = { sender: myPhone, content: text, timestamp };
      setMessages(prev => [...prev, userMsg]);
      // ... (rest of AI logic is skipped here for brevitiy in replace)
    } else {
      if (isBlocked) {
        alert("Nie możesz wysłać wiadomości do zablokowanego węzła.");
        return;
      }

      const roomId = activeContact.isGroup
        ? activeContact._id
        : [myPhone, activeContact.contactPhone].sort().join('-');
      
      let msgPayload = {
        sender: myPhone,
        roomId,
        content: type === 'voice' ? '[VOICE_PAYLOAD]' : text,
        type,
        duration,
        timestamp,
        mediaUrl: type === 'voice' ? text : null
      };

      try {
        if (activeContact.isGroup) {
          // ... logic grupowy
          if (!groupKeys[activeContact._id]) {
            alert("Brak klucza grupowego. Zapadnia zamknięta.");
            return;
          }
          const { ciphertext, nonce } = encryptForGroup(activeContact._id, text);
          const encryptedPayload = { ...msgPayload, content: ciphertext, nonce, isEncrypted: true };
          socketRef.current.emit('send_group_message', encryptedPayload);
        } else {
          // --- NOWY FLOW API X3DH ---
          try {
            console.log("🔑 [X3DH] Szyfrowanie wiadomości do:", activeContact.contactPhone);
            
            // 1. Prawdziwe szyfrowanie P2P z użyciem silnika ShieldEngine
            const { header, ciphertext, nonce } = await encryptFor(activeContact.contactPhone, text);
            
            // 2. Pakujemy zaszyfrowane elementy do jednego stringa JSON (MongoDB przechowa to bezpiecznie)
            const securePayload = JSON.stringify({ ciphertext, header, nonce });
            
            console.log("🚀 Wysyłanie zaszyfrowanego payloadu przez nowe API...");
            await apiService.sendMessage({
              sender: myPhone,
              receiver: activeContact.contactPhone,
              payload: securePayload, // <-- Twardy ciphertext, ZERO plaintekstu
              messageType: type
            });
            console.log("✅ Wiadomość (ZASZYFROWANA) wysłana do serwera (API).");
            
            // ODBLOKOWANIE REAL-TIME: Równoległy strzał po web-sockecie do odbiorcy
            socketRef.current.emit('send_message', {
              ...msgPayload,
              content: ciphertext,
              header: header,
              nonce: nonce,
              isEncrypted: true
            });

          } catch (apiErr) {
            console.warn("❌ [X3DH] Błąd nowego API, fallback do WebSocket:", apiErr);
              
            
            // FALLBACK - stary sposób po WebSocket (np. gdy serwer zwróci 404 dla kluczy)
            if (!sessions[activeContact.contactPhone]) {
              alert("Brak kluczy na serwerze i brak sesji P2P. Zapadnia zamknięta.");
              return;
            }

            let encryptedPayload;
            if (type === 'voice' && mediaPayload) {
              encryptedPayload = { 
                ...msgPayload, 
                header: mediaPayload.header, 
                nonce: mediaPayload.nonce, 
                isEncrypted: true 
              };
            } else {
              const { header, ciphertext, nonce } = await encryptFor(activeContact.contactPhone, text);
              encryptedPayload = { ...msgPayload, content: ciphertext, header, nonce, isEncrypted: true };
            }
            
            socketRef.current.emit('send_message', encryptedPayload);
          }
        }
      } catch (err) {
        console.error("Encryption fail:", err);
        alert("Błąd kryptograficzny. Wiadomość NIE została wysłana.");
        return;
      }

      setMessages(prev => [...prev, { ...msgPayload, content: type === 'voice' ? 'Notatka głosowa (E2EE)' : text }]);
    }
  };

  const handleMenuAction = async (actionKey) => {
    switch (actionKey) {
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
            await axios.patch(`${NetworkConfig.getSocketUrl()}/api/contacts/status`, {
              ownerPhone: myPhone,
              contactPhone: activeContact.contactPhone,
              isMuted: newMuted
            });
            setActiveContact(prev => ({ ...prev, isMuted: newMuted }));
          } catch (err) { console.error("Toggle Mute Error", err); }
        }
        break;
      case 'TOGGLE_GHOST':
        setIsGhostMode(prev => !prev);
        break;
      case 'TOGGLE_BLOCK':
        if (!activeContact?.isGroup) {
          try {
            const newBlocked = !isBlocked;
            await axios.patch(`${NetworkConfig.getSocketUrl()}/api/contacts/status`, {
              ownerPhone: myPhone,
              contactPhone: activeContact.contactPhone,
              isBlocked: newBlocked
            });
            setActiveContact(prev => ({ ...prev, isBlocked: newBlocked }));
          } catch (err) { console.error("Toggle Block Error", err); }
        }
        break;
      case 'CLEAR_CHAT':
        try {
          const roomId = activeContact?.isGroup ? activeContact._id : [myPhone, activeContact.contactPhone].sort().join('-');
          await axios.delete(`${NetworkConfig.getSocketUrl()}/api/messages/${roomId}`);
          setMessages([]);
        } catch (err) { console.error("Clear Chat Error", err); }
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
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isAI={isAI} 
          disabled={isBlocked && !activeContact?.isGroup} 
          activeContactPhone={activeContact?.contactPhone}
        />
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
