import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, FlatList, TextInput, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableOpacity, StatusBar
} from 'react-native';
import { 
  VxBackIcon, 
  VxSecurityIcon, 
  VxMoreIcon 
} from '../components/ui/icons/static';
import { VxSendIcon } from '../components/ui/icons/kinetic';
import io from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import NetworkConfig from '../services/NetworkConfig';
import { formatTime } from '../utils/formatters';
import ScaledText from '../components/ScaledText';
import { useShield } from '../context/ShieldContext';
import GlassMenuModal from '../components/GlassMenuModal';
import HologramProfileModal from '../components/HologramProfileModal';

export default function GroupChatScreen({ route, navigation }) {
  const { groupId, groupName, groupMembers, adminPhone } = route.params || {};

  const [myPhone, setMyPhone] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isProfileVisible, setProfileVisible] = useState(false);
  
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const { groupKeys, setupGroupSession, encryptForGroup, decryptFromGroup } = useShield();

  useEffect(() => {
    const init = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      setMyPhone(phone);

      // Inicjalizacja E2EE Grupy z wykorzystaniem Envelope
      if (!groupKeys[groupId]) {
        try {
          const myMemberRecord = groupMembers.find(m => m.phone === phone);
          if (myMemberRecord) {
            // W idealnym scenariuszu tutaj też mamy publiczny klucz admina do weryfikacji tożsamości z API
            // Ponieważ na ten moment mamy tylko envelope, zakładamy zaufanie lub musielibyśmy pobrać pubKey admina.
            
            // UWAGA: Trzeba by pociągnąć klucz publiczny admina z API `GET /api/users`.
            // Dla prostoty i demonstracji symetrycznej izolacji zakładamy, że odbieramy poprawny envelope:
            const adminUser = await axios.get(`${NetworkConfig.BASE_URL}/api/users/${adminPhone}`).then(r => r.data.user);
            
            if(adminUser && adminUser.publicKey) {
               await setupGroupSession(groupId, myMemberRecord.encryptedKey, myMemberRecord.nonce || 'EMPTY', adminUser.publicKey);
            }
          }
        } catch (err) {
          console.error("🛡️ [SHIELD GROUP] Błąd odszyfrowywania koperty:", err);
        }
      }
      setIsReady(true);
    };

    init();
  }, [groupId]);

  useEffect(() => {
    if (!myPhone || !isReady) return;

    const socket = io(NetworkConfig.getSocketUrl(), {
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_room', { roomId: groupId });
    });

    socket.on('receive_group_message', async (data) => {
      if (data.isEncrypted && data.sender !== myPhone) {
        try {
           const decrypted = decryptFromGroup(groupId, data.content, data.nonce);
           setMessages(prev => [...prev, { ...data, content: decrypted, id: Date.now().toString(), status: 'delivered' }]);
        } catch (e) {
           console.error('🛡️ [SHIELD GROUP] Błąd deszyfrowania:', e);
           setMessages(prev => [...prev, { ...data, content: '[ZABLOKOWANE KRYPTOGRAFICZNIE]', id: Date.now().toString() }]);
        }
      } else if (!data.isEncrypted) {
         setMessages(prev => [...prev, { ...data, id: Date.now().toString(), status: 'delivered' }]);
      }
    });

    return () => socket.disconnect();
  }, [myPhone, isReady, groupId]);
const handleSend = useCallback(() => {
  if (!inputText.trim()) return;

  const text = inputText.trim();
  setInputText('');

  let msgPayload = { sender: myPhone, roomId: groupId, content: text, timestamp: new Date() };

  // Szyfrowanie symetryczne grupowym sekretem (ENFORCED)
  if (!groupKeys[groupId]) {
    alert("Brak klucza grupowego. Zapadnia zamknięta.");
    return; // Przerwij wysyłanie jawnego tekstu
  }

  try {
    const { ciphertext, nonce } = encryptForGroup(groupId, text);
    const encryptedPayload = { ...msgPayload, content: ciphertext, nonce: nonce, isEncrypted: true };
    socketRef.current?.emit('send_group_message', encryptedPayload);
  } catch (e) {
    console.error('🛡️ [SHIELD] Błąd szyfrowania grupy', e);
    alert("Błąd kryptograficzny. Wiadomość NIE została wysłana.");
    return; // Przerwij wysyłanie jawnego tekstu
  }

  setMessages(prev => [...prev, { ...msgPayload, id: Date.now().toString(), status: 'sent' }]);
}, [inputText, myPhone, groupId, groupKeys, encryptForGroup]);

  const handleMenuAction = async (actionKey) => {
    switch(actionKey) {
      case 'VIEW_CONTACT':
        setProfileVisible(true);
        break;
      case 'SEARCH':
        alert('Szukanie w grupie wyłączone dla vBETA.');
        break;
      case 'MEDIA':
        alert('Przeglądarka zasobów niedostępna.');
        break;
      case 'TOGGLE_MUTE':
        setIsMuted(prev => !prev);
        // Do zrobienia w bazie MongoDB (model Grupy nie posiada jeszcze isMuted na per-użytkownik)
        break;
      case 'TOGGLE_GHOST':
        setIsGhostMode(prev => !prev);
        break;
      case 'TOGGLE_BLOCK':
        alert('Nie możesz zablokować całej grupy. Musiałbyś z niej wyjść.');
        break;
      case 'CLEAR_CHAT':
        try {
           await axios.delete(`${NetworkConfig.BASE_URL}/api/messages/${groupId}`);
           setMessages([]);
        } catch (e) {}
        break;
      case 'ADD_SHORTCUT':
        alert('Brak uprawnień na skróty ekranowe.');
        break;
    }
  };

  useEffect(() => {
     return () => {
        if (isGhostMode) {
           console.log("👻 Zamknięto grupę w trybie Ghost. Ciche niszczenie procesu sesyjnego.");
        }
     }
  }, [isGhostMode]);

  const renderMessage = ({ item }) => {
    const isMe = item.sender === myPhone;
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
        {!isMe && <Text style={styles.senderLabel}>{item.sender}</Text>}
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <View style={styles.messageFooter}>
            <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
            {isMe && <Text style={styles.statusText}>✓</Text>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <CyberBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <GlassView intensity={15} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <VxBackIcon size={24} color={VextroTheme.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <VxSecurityIcon size={16} color={VextroTheme.primary} style={{ marginRight: 6 }} />
              <ScaledText style={styles.headerTitle}>{groupName || 'Grupa'}</ScaledText>
            </View>
            <ScaledText style={styles.headerSubtitle}>
              {isConnected ? 'WĘZEŁ ONLINE' : 'ŁĄCZENIE...'}
            </ScaledText>
          </View>
          <VxSecurityIcon size={24} color={groupKeys[groupId] ? VextroTheme.primary : VextroTheme.textMuted} style={{ marginRight: 12 }} />
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <VxMoreIcon color={VextroTheme.textMuted} size={24} />
          </TouchableOpacity>
        </GlassView>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <GlassView intensity={20} style={styles.inputSection}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="NADAJ TRANSMISJĘ..."
              placeholderTextColor={VextroTheme.textMuted}
              multiline
              maxLength={1000}
              selectionColor={VextroTheme.primary}
            />
            <TouchableOpacity 
              onPress={sendMessage}
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              disabled={!inputText.trim()}
            >
              <VxSendIcon size={20} color={inputText.trim() ? VextroTheme.primary : VextroTheme.textMuted} />
            </TouchableOpacity>
          </GlassView>
        </KeyboardAvoidingView>

        <GlassMenuModal 
          visible={isMenuVisible} 
          onClose={() => setMenuVisible(false)} 
          onAction={handleMenuAction}
          isMuted={isMuted}
          isBlocked={false} // Blokady na razie nie wspierane dla całych grup
          isGhost={isGhostMode}
        />

        <HologramProfileModal
          visible={isProfileVisible}
          onClose={() => setProfileVisible(false)}
          data={{ title: groupName, phoneNumber: groupId, remotePublicKey: groupId, isGroup: true }}
          onAction={handleMenuAction}
          isMuted={isMuted}
          isBlocked={false}
        />
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: VextroTheme.text, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { color: VextroTheme.accent, fontSize: 10, marginTop: 2, fontFamily: 'monospace' },
  chatContainer: { padding: 16, paddingBottom: 32 },
  bubbleWrapper: { marginBottom: 12, maxWidth: '85%' },
  bubbleWrapperLeft: { alignSelf: 'flex-start' },
  bubbleWrapperRight: { alignSelf: 'flex-end' },
  bubble: { padding: 14, borderRadius: 18 },
  bubbleLeft: { backgroundColor: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bubbleRight: { backgroundColor: 'rgba(191,0,255,0.2)', borderBottomRightRadius: 4, borderWidth: 1, borderColor: 'rgba(191,0,255,0.4)' },
  senderLabel: { color: VextroTheme.textMuted, fontSize: 10, marginLeft: 4, marginBottom: 4, letterSpacing: 1 },
  messageText: { color: VextroTheme.text, fontSize: 14, lineHeight: 20 },
  messageFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4, gap: 4 },
  timeText: { color: VextroTheme.textMuted, fontSize: 10 },
  statusText: { color: VextroTheme.accent, fontSize: 10 },
  inputSection: { flexDirection: 'row', alignItems: 'center', padding: 12, margin: 16, borderRadius: 24 },
  input: { flex: 1, color: VextroTheme.text, fontSize: 14, minHeight: 40, maxHeight: 100, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(191,0,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: 'transparent' },
});
