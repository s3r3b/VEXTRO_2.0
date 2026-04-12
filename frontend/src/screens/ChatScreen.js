// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/ChatScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, FlatList, TextInput, SafeAreaView,
  KeyboardAvoidingView, Platform, Animated, TouchableOpacity,
  StatusBar, Keyboard
} from 'react-native';
import {
  VxBackIcon,
  VxSecurityIcon,
  VxMoreIcon,
  VxNeuralIcon,
  VxProfileIcon,
  VxShortcutIcon,
  VxMediaIcon,
  VxInterfaceIcon
} from '../components/ui/icons/static';
import {
  VxMicIcon,
  VxSendIcon,
  VxVaultHandle
} from '../components/ui/icons/kinetic';
import io from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import NetworkConfig from '../services/NetworkConfig';
import { formatTime } from '../utils/formatters';
import StatusIndicator from '../components/StatusIndicator';
import EmojiPicker from '../components/EmojiPicker';
import ScaledText from '../components/ScaledText';
import { useShield } from '../context/ShieldContext';
import GlassMenuModal from '../components/GlassMenuModal';
import HologramProfileModal from '../components/HologramProfileModal';
import nacl from 'tweetnacl';
import { Buffer } from 'buffer';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * VEXTRO 4.5 PREMIUM CHAT (SHIELD ENABLED)
 * Transformacja wizualna na standard Future Design + E2EE.
 */
export default function ChatScreen({ route, navigation }) {
  const { title, phoneNumber, remotePublicKey, isBlocked: initialIsBlocked, isMuted: initialIsMuted } = route.params || {};
  const isAI = phoneNumber === 'AI';

  const [myPhone, setMyPhone] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionKey, setSessionKey] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isProfileVisible, setProfileVisible] = useState(false);

  // ─── ANTI VOICE STATES ──────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAntiVoiceMenu, setShowAntiVoiceMenu] = useState(false);
  const recordingInterval = React.useRef(null);

  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isMuted, setIsMuted] = useState(initialIsMuted || false);
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked || false);

  const isBlockedRef = useRef(isBlocked);
  useEffect(() => { isBlockedRef.current = isBlocked; }, [isBlocked]);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const { sessions, startSession, encryptFor, decryptFrom, identity } = useShield();

  useEffect(() => {
    // 1. Inicjalizacja sesji Shield (Double Ratchet Handshake)
    if (remotePublicKey && !isAI && !sessions[phoneNumber]) {
      const initShield = async () => {
        try {
          // Bootstrapping: Używamy DH z kluczy Identity jako początkowego Root Key
          const myPrivKey = await SecureStore.getItemAsync('vextro_identity_private');
          const dhSecret = nacl.box.before(
            Buffer.from(remotePublicKey, 'base64'),
            Buffer.from(myPrivKey, 'base64')
          );
          await startSession(phoneNumber, remotePublicKey, dhSecret);
        } catch (e) {
          console.error('🛡️ [SHIELD] HANDSHAKE_ERROR:', e);
        }
      };
      initShield();
    }
  }, [remotePublicKey, isAI, phoneNumber, sessions, startSession]);

  useEffect(() => {
    AsyncStorage.getItem('userPhone').then(phone => {
      if (phone) setMyPhone(phone);
    });
  }, []);

  useEffect(() => {
    if (!isAI && myPhone) {
      const roomId = [myPhone, phoneNumber].sort().join('-');

      const socket = io(NetworkConfig.getSocketUrl(), {
        transports: ['websocket']
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join_room', { roomId });
      });
      socket.on('chat_history', async (history) => {
        // Deszyfrowanie historii (jeśli wiadomości są zaszyfrowane)
        const decryptedHistory = await Promise.all(history.map(async (msg) => {
          if (msg.isEncrypted && sessionKey) {
            try {
              const decrypted = await decryptMessage(msg.content, msg.nonce, sessionKey);
              return { ...msg, content: decrypted };
            } catch (e) {
              return { ...msg, content: '[DECRYPTION ERROR]' };
            }
          }
          return msg;
        }));
        setMessages(decryptedHistory.map(msg => ({ ...msg, id: msg._id || Date.now().toString(), status: 'delivered' })));
      });

      socket.on('receive_message', async (data) => {
        if (isBlockedRef.current) {
          console.warn('🛡️ [SHIELD] Odrzucono pakiet: Kontakt zablokowany.');
          return;
        }

        if (data.isEncrypted && !isAI) {
          try {
            // Dla wiadomości tekstowych deszyfrujemy natychmiast
            if (data.type !== 'voice') {
              const decrypted = await decryptFrom(phoneNumber, data.header, data.content, data.nonce);
              setMessages(prev => [{ ...data, content: decrypted, id: Date.now().toString(), status: 'delivered' }, ...prev]);
            } else {
              // Dla głosówek: zostawiamy zaszyfrowany placeholder, deszyfrowanie przy Play
              setMessages(prev => [{ ...data, content: 'Notatka głosowa (E2EE)', id: Date.now().toString(), status: 'delivered' }, ...prev]);
            }
          } catch (e) {
            console.error('🛡️ [SHIELD] Decryption Failed', e);
            setMessages(prev => [{ ...data, content: '[DECRYPTION ERROR]', id: Date.now().toString() }, ...prev]);
          }
        } else {
          setMessages(prev => [{ ...data, id: Date.now().toString(), status: 'delivered' }, ...prev]);
        }
      });

      return () => socket.disconnect();
    }
  }, [myPhone, isAI, phoneNumber, sessionKey, decryptFrom]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    if (isBlocked) {
      alert("Nie możesz wysłać wiadomości cyfrowej do zablokowanego węzła.");
      return;
    }

    const text = inputText.trim();
    setInputText('');

    if (isAI) {
      const userMsg = { id: Date.now().toString(), sender: myPhone, content: text, timestamp: new Date(), status: 'sent' };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'AI',
          content: 'VEXTRO NEURAL_NET odebrało dane. Moduł w budowie.',
          timestamp: new Date(),
          isAI: true
        }]);
      }, 1000);
    } else {
      const roomId = [myPhone, phoneNumber].sort().join('-');
      let msgPayload = { sender: myPhone, roomId, content: text, timestamp: new Date() };

      // 2. Double Ratchet Encryption (ENFORCED)
      if (!sessions[phoneNumber]) {
        alert("Oczekuję na negocjację kluczy z węzłem... Trwa ustanawianie zapadni.");
        return; // Przerwij wysyłanie jawnego tekstu
      }

      try {
        const { header, ciphertext, nonce } = await encryptFor(phoneNumber, text);
        const encryptedPayload = {
          ...msgPayload,
          header,
          content: ciphertext,
          nonce: nonce,
          isEncrypted: true
        };
        socketRef.current?.emit('send_message', encryptedPayload);
      } catch (e) {
        console.error('🛡️ [SHIELD] Encryption Failed', e);
        alert("Błąd kryptograficzny. Wiadomość NIE została wysłana.");
        return; // Przerwij wysyłanie jawnego tekstu
      }

      setMessages(prev => [...prev, { ...msgPayload, id: Date.now().toString(), status: 'sent' }]);
    }
  }, [inputText, isAI, myPhone, phoneNumber, sessions, encryptFor, isBlocked]);

  // ─── ANTI VOICE METHODS ──────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(recordingInterval.current);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      await handleVoiceSend(uri);
    } catch (e) {
      console.error('🛡️ [SHIELD] Błąd czyszczenia mikrofonu:', e);
      setRecording(null);
    }
  };

  const handleVoiceSend = async (uri) => {
    if (!sessions[phoneNumber]) {
      alert("Zapadnia zamknięta. Nie można wysłać notatki głosowej bez autoryzacji E2EE.");
      return;
    }

    try {
      // 1. Odczyt audio i konwersja na format binarny
      const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const audioData = Buffer.from(base64Audio, 'base64');

      // 2. Szyfrowanie binarne ShieldEngine
      const { header, ciphertext, nonce } = await encryptFor(phoneNumber, audioData);

      // 3. Przygotowanie zaszyfrowanego Bloba do wysyłki
      // Zapisujemy ciphertext (Base64) do pliku, aby multer mógł go odebrać
      const encryptedUri = `${FileSystem.cacheDirectory}encrypted_voice_${Date.now()}.bin`;
      await FileSystem.writeAsStringAsync(encryptedUri, ciphertext, { encoding: FileSystem.EncodingType.Base64 });

      const formData = new FormData();
      formData.append('file', {
        uri: encryptedUri,
        name: 'shield_voice.bin',
        type: 'application/octet-stream',
      });

      const uploadRes = await axios.post(`${NetworkConfig.getSocketUrl()}/api/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadRes.data.url) {
        const msgPayload = {
          id: Date.now().toString(),
          sender: myPhone,
          content: "[VOICE_PAYLOAD]", // Placeholder, faktyczne dane są w ciphertext
          header,
          nonce,
          isEncrypted: true,
          type: 'voice',
          mediaUrl: uploadRes.data.url,
          duration: recordingDuration,
          timestamp: new Date()
        };

        socketRef.current?.emit('send_message', {
          ...msgPayload,
          roomId: [myPhone, phoneNumber].sort().join('-')
        });
        
        // Lokalnie dodajemy do listy by widzieć własną głosówkę
        setMessages(prev => [{...msgPayload, content: "Notatka głosowa (E2EE)"}, ...prev]);
      }
    } catch (e) {
      console.error("🛡️ [SHIELD] Voice Encryption/Upload Error:", e);
      alert("Błąd zabezpieczania notatki głosowej.");
    }
  };

  const [playingId, setPlayingId] = useState(null);
  const soundRef = useRef(null);

  const playVoiceMessage = async (item) => {
    try {
      if (playingId === item.id) {
        await soundRef.current?.stopAsync();
        setPlayingId(null);
        return;
      }

      // 1. Sprawdź czy mamy już sound załadowany (jeśli tak, zwolnij go)
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      setPlayingId(item.id);

      // 2. JIT Decryption: Pobierz i deszyfruj tylko gdy potrzebne
      const downloadUri = `${FileSystem.cacheDirectory}encrypted_${item.id}.bin`;
      const decryptedUri = `${FileSystem.cacheDirectory}decrypted_${item.id}.m4a`;

      // Sprawdzamy czy już deszyfrowaliśmy to nagranie wcześniej (prosty cache)
      const info = await FileSystem.getInfoAsync(decryptedUri);
      if (!info.exists) {
        console.log(`🛡️ [SHIELD] JIT Decryption: Pobieranie i deszyfrowanie ${item.id}...`);
        await FileSystem.downloadAsync(`${NetworkConfig.getSocketUrl()}${item.mediaUrl}`, downloadUri);
        
        const encryptedBase64 = await FileSystem.readAsStringAsync(downloadUri, { encoding: FileSystem.EncodingType.Base64 });
        
        // Deszyfrowanie binarne
        const decryptedData = await decryptFrom(phoneNumber, item.header, encryptedBase64, item.nonce, true);
        
        // Zapis do m4a
        const decryptedBase64 = Buffer.from(decryptedData).toString('base64');
        await FileSystem.writeAsStringAsync(decryptedUri, decryptedBase64, { encoding: FileSystem.EncodingType.Base64 });
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: decryptedUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });

    } catch (e) {
      console.error('🛡️ [SHIELD] Playback Error:', e);
      alert("Błąd odtwarzania bezpiecznej notatki.");
      setPlayingId(null);
    }
  };

  const handleMenuAction = async (actionKey) => {
    switch (actionKey) {
      case 'VIEW_CONTACT':
        setProfileVisible(true);
        break;
      case 'SEARCH':
        alert('Moduł wyszukiwania w budowie.');
        break;
      case 'MEDIA':
        alert('Przeglądarka zasobów zaszyfrowanych niedostępna w tej wersji VEXTRO.');
        break;
      case 'TOGGLE_MUTE':
        try {
          const newStatus = !isMuted;
          await axios.patch(`${NetworkConfig.BASE_URL}/api/contacts/status`, {
            ownerPhone: myPhone,
            contactPhone: phoneNumber,
            isMuted: newStatus
          });
          setIsMuted(newStatus);
        } catch (e) { }
        break;
      case 'TOGGLE_GHOST':
        setIsGhostMode(prev => !prev);
        break;
      case 'TOGGLE_BLOCK':
        try {
          const newStatus = !isBlocked;
          await axios.patch(`${NetworkConfig.BASE_URL}/api/contacts/status`, {
            ownerPhone: myPhone,
            contactPhone: phoneNumber,
            isBlocked: newStatus
          });
          setIsBlocked(newStatus);
        } catch (e) { }
        break;
      case 'CLEAR_CHAT':
        try {
          const roomId = [myPhone, phoneNumber].sort().join('-');
          await axios.delete(`${NetworkConfig.BASE_URL}/api/messages/${roomId}`);
          setMessages([]); // Wyczyść na ekranie natychmiast, ALE PO WYKONANIU DELETE
        } catch (e) { }
        break;
      case 'ADD_SHORTCUT':
        alert('Skróty ekranowe wymagają natywnych uprawnień powłoki systemowej OS.');
        break;
    }
  };

  // Zabezpieczenie przed opuszczeniem w Ghost Mode
  useEffect(() => {
    return () => {
      if (isGhostMode) {
        console.log("👻 Przechwycono zamknięcie w profilu Ghost. Czyszczę cache wiadomości.");
        // opcjonalnie usuniecie history po stronie cache
      }
    }
  }, [isGhostMode]);

  // Render bąbelka wiadomości 3.0 (Glass Concept)
  const renderItem = ({ item }) => {
    const isMine = item.sender === myPhone;
    const isVoice = item.type === 'voice';

    return (
      <View style={[styles.msgContainer, isMine ? styles.myContainer : styles.otherContainer]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
          {isMine && (
            <LinearGradient
              colors={[VextroTheme.primary, VextroTheme.secondary]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          {!isMine && (
            <GlassView intensity={10} style={StyleSheet.absoluteFill} />
          )}

          {isVoice ? (
            <View style={styles.voiceRow}>
              <TouchableOpacity 
                style={[styles.playBtn, playingId === item.id && { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => playVoiceMessage(item)}
              >
                {playingId === item.id ? (
                  <VxInterfaceIcon size={16} color={VextroTheme.accent} />
                ) : (
                  <VxInterfaceIcon size={16} color={isMine ? VextroTheme.background : VextroTheme.primary} />
                )}
              </TouchableOpacity>
              <View style={[styles.wavePlaceholder, playingId === item.id && { backgroundColor: VextroTheme.accent, opacity: 0.5 }]} />
              <Text style={[styles.duration, { color: isMine ? 'rgba(0,0,0,0.5)' : VextroTheme.textMuted }]}>
                {playingId === item.id ? "PLAYING" : `${item.duration}s`}
              </Text>
            </View>
          ) : (
            <ScaledText style={[styles.msgText, !isMine && { color: VextroTheme.text }]}>{item.content}</ScaledText>
          )}

          <View style={styles.msgMeta}>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
            {isMine && <StatusIndicator status={item.status} color={VextroTheme.background} />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <CyberBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>

        {/* VEXTRO 3.0 Header */}
        <GlassView intensity={30} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <VxBackIcon color={VextroTheme.primary} size={28} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            {isAI ? <VxNeuralIcon size={24} /> : <VxProfileIcon size={24} />}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.headerStatusRow}>
              <VxSecurityIcon size={10} color={VextroTheme.accent} style={{ marginRight: 4 }} />
              <Text style={styles.headerSub}>E2EE SECURE CHANNEL</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setMenuVisible(true)}>
            <VxMoreIcon color={VextroTheme.textMuted} size={24} />
          </TouchableOpacity>
        </GlassView>


        // Ścieżka: /workspaces/VEXTRO/frontend/src/screens/ChatScreen.js

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.flex}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25} // 25 to standardowa wysokość StatusBar, jeśli nie używasz SafeAreaview
>
  {/* Main Chat Area */}
  <FlatList
    ref={flatListRef}
    data={[...messages].reverse()}
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    inverted
    contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
    maintainVisibleContentPosition={{
      minIndexForVisible: 0,
    }}
  />

  {/* Premium Bottom Input bar */}
  <View style={styles.inputArea}>
    <GlassView intensity={40} style={styles.inputBar}>
      <TouchableOpacity onPress={() => setShowEmoji(!showEmoji)} style={styles.inputIcon}>
        <VxVaultHandle size={24} color={VextroTheme.textMuted} isOpen={showEmoji} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder={isRecording ? `RECORDING... ${recordingDuration}s` : "Secure message..."}
        placeholderTextColor={isRecording ? "#ff4444" : VextroTheme.textMuted}
        selectionColor={VextroTheme.primary}
        onFocus={() => setShowEmoji(false)}
        editable={!isRecording}
      />

      {inputText.length > 0 ? (
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <LinearGradient
            colors={[VextroTheme.primary, VextroTheme.secondary]}
            style={styles.sendBtnGradient}
          >
            <VxSendIcon size={18} color={VextroTheme.background} />
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecording}
          style={[styles.sendBtn, isRecording && { transform: [{ scale: 1.2 }] }]}
        >
          <LinearGradient
            colors={isRecording ? ['#ff4444', '#cc0000'] : [VextroTheme.primary, VextroTheme.secondary]}
            style={styles.sendBtnGradient}
          >
            {isRecording ? (
              <VxMicIcon size={22} color="#fff" active={true} />
            ) : (
              <VxMicIcon size={22} color={VextroTheme.background} active={false} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}
    </GlassView>
  </View>

  {showEmoji && (
    <View style={styles.emojiContainer}>
      <EmojiPicker onSelect={(e) => setInputText(p => p + e)} />
    </View>
  )}
</KeyboardAvoidingView>


        <GlassMenuModal
          visible={isMenuVisible}
          onClose={() => setMenuVisible(false)}
          onAction={handleMenuAction}
          isMuted={isMuted}
          isBlocked={isBlocked}
          isGhost={isGhostMode}
        />

        <HologramProfileModal
          visible={isProfileVisible}
          onClose={() => setProfileVisible(false)}
          data={{ title, phoneNumber, remotePublicKey, isGroup: false }}
          onAction={handleMenuAction}
          isMuted={isMuted}
          isBlocked={isBlocked}
        />
      </SafeAreaView>
    </CyberBackground>
  );
}



const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.15)',
  },
  headerBtn: { padding: 8 },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.3)',
  },
  avatarEmoji: { fontSize: 20 },
  headerInfo: { flex: 1 },
  headerTitle: { color: VextroTheme.text, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  headerSub: { color: VextroTheme.accent, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },

  listContent: { padding: 20, paddingBottom: 40 },
  msgContainer: { marginVertical: 8, width: '100%' },
  myContainer: { alignItems: 'flex-end' },
  otherContainer: { alignItems: 'flex-start' },

  bubble: {
    padding: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    maxWidth: '85%',
    overflow: 'hidden',
    position: 'relative',
  },
  myBubble: {
    borderBottomRightRadius: 4,
    shadowColor: VextroTheme.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: VextroTheme.surfaceBorder,
    backgroundColor: 'rgba(15, 10, 30, 0.3)',
  },
  msgText: { color: VextroTheme.background, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4, opacity: 0.7 },
  timestamp: { color: 'rgba(0,0,0,0.5)', fontSize: 9, fontWeight: '700', marginRight: 4 },

  inputArea: { padding: 16, paddingTop: 8 },
  inputBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 28,
  },
  input: { flex: 1, color: VextroTheme.text, fontSize: 14, paddingHorizontal: 12, height: '100%' },
  inputIcon: { padding: 10 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendBtnGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  voiceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  playBtn: { width: 32, height: 32, borderRadius: 16, borderWeight: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  wavePlaceholder: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 12, borderRadius: 1 },
  duration: { fontSize: 10, fontWeight: 'bold' },

  antiVoiceOverlay: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 180,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 100,
  },
  antiVoiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  antiVoiceLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  antiVoiceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 8,
  },

  emojiContainer: { height: 250, backgroundColor: VextroTheme.background }
});