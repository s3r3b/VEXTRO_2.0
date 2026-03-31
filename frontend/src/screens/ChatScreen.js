// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/ChatScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import io from 'socket.io-client';
import StatusIndicator from '../components/StatusIndicator';
import { formatTime } from '../utils/formatters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CyberButton from '../components/CyberButton';
import EmojiPicker from '../components/EmojiPicker';
import axios from 'axios';

const SERVER_URL = 'https://vextro-backend-1774716748.loca.lt';

// ─── Typing Indicator ───────────────────────────────────────────────────────
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    pulse(dot1, 0);
    pulse(dot2, 200);
    pulse(dot3, 400);
  }, []);

  const dotStyle = (anim) => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B026FF',
    marginHorizontal: 3,
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={styles.typingBubble}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

// ─── Custom Header ───────────────────────────────────────────────────────────
function ChatHeader({ title, phoneNumber, isAI, navigation }) {
  return (
    <View style={styles.header}>
      <CyberButton onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>‹</Text>
      </CyberButton>
      <View style={styles.headerAvatar}>
        <Text style={{ fontSize: 20 }}>{isAI ? '🤖' : '👤'}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.headerSub}>
          {isAI ? 'VEXTRO AI · SYSTEM READY' : `${phoneNumber} · E2E ENCRYPTED`}
        </Text>
      </View>
      <View style={[styles.headerDot, { backgroundColor: isAI ? '#B026FF' : '#00FF9C' }]} />
    </View>
  );
}

// ─── E2EE Banner ─────────────────────────────────────────────────────────────
function E2EEBanner() {
  return (
    <View style={styles.e2eeBanner}>
      <Text style={styles.e2eeText}>🔒  KANAŁ W PEŁNI ZASZYFROWANY  ·  END-TO-END</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ChatScreen({ route, navigation }) {
  const { title, phoneNumber } = route.params || {};
  const isAI = phoneNumber === 'AI';

  const [myPhone, setMyPhone] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // Glitch entry animation
  const glitchOpacity = useRef(new Animated.Value(0)).current;
  const glitchTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(glitchOpacity, { toValue: 0.8, duration: 50, useNativeDriver: true }),
      Animated.timing(glitchTranslateX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(glitchOpacity, { toValue: 0.4, duration: 50, useNativeDriver: true }),
      Animated.timing(glitchTranslateX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(glitchOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(glitchTranslateX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    AsyncStorage.getItem('userPhone').then(phone => {
      if (phone) setMyPhone(phone);
    });

    if (!isAI) {
      // Prawdziwy czat przez Socket.IO
      const socket = io(SERVER_URL, {
        transports: ['websocket'],
        extraHeaders: {
          'bypass-tunnel-reminder': 'true'
        }
      });
      socketRef.current = socket;

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));

      socket.on('chat_history', (history) => {
        const formatted = history.map(msg => ({
          ...msg,
          id: msg._id,
          status: 'delivered',
        }));
        setMessages(formatted);
      });

      socket.on('receive_message', (data) => {
        setMessages(prev => [...prev, { ...data, id: Date.now().toString(), status: 'delivered' }]);
      });

      socket.on('message_read', (msgId) => {
        setMessages(prev =>
          prev.map(m => (m.id === msgId ? { ...m, status: 'read' } : m))
        );
      });

      return () => socket.disconnect();
    }
  }, []);

  // ─── Wyślij wiadomość ─────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    if (isAI) {
      // Tryb AI: lokalne wiadomości + call do API
      const userMsg = {
        id: Date.now().toString(),
        sender: myPhone,
        content: text,
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const apiKey = await AsyncStorage.getItem('ai_api_key');
        if (!apiKey) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '_err',
              sender: 'AI',
              content: '⚠️ Brak klucza API. Skonfiguruj go w Ustawienia → AI with private API.',
              timestamp: new Date(),
              status: 'delivered',
            },
          ]);
          return;
        }

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: text }],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const aiReply = response.data.choices[0].message.content;
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + '_ai',
            sender: 'AI',
            content: aiReply,
            timestamp: new Date(),
            status: 'delivered',
          },
        ]);
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + '_err',
            sender: 'AI',
            content: `⚠️ Błąd AI: ${err?.response?.data?.error?.message || err.message}`,
            timestamp: new Date(),
            status: 'delivered',
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Tryb czatu Socket.IO
      const msgPayload = { sender: myPhone, content: text, timestamp: new Date() };
      socketRef.current?.emit('send_message', msgPayload);
      setMessages(prev => [
        ...prev,
        { ...msgPayload, id: Date.now().toString(), status: 'sent' },
      ]);
    }
  }, [inputText, isAI, myPhone]);

  // ─── Render wiadomości ────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const isMine = item.sender === myPhone;
    return (
      <View style={isMine ? styles.myMsg : styles.otherMsg}>
        <Text style={styles.msgText}>{item.content}</Text>
        <View style={styles.msgMeta}>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          {isMine && <StatusIndicator status={item.status} />}
        </View>
      </View>
    );
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    setShowScrollBtn(contentHeight - offsetY - layoutHeight > 150);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom header */}
      <ChatHeader
        title={title}
        phoneNumber={phoneNumber}
        isAI={isAI}
        navigation={navigation}
      />

      {/* Sieć offline banner */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚡ POŁĄCZENIE UTRACONE – TRYB OFFLINE</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Animated.View
          style={{
            flex: 1,
            opacity: glitchOpacity,
            transform: [{ translateX: glitchTranslateX }],
          }}
        >
          {/* E2EE banner */}
          <E2EEBanner />

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          />

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <TouchableOpacity
              style={styles.scrollBtn}
              onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
            >
              <Text style={styles.scrollBtnText}>↓</Text>
            </TouchableOpacity>
          )}

          {/* Emoji Picker */}
          <EmojiPicker
            visible={showEmoji}
            onSelect={(emoji) => setInputText(prev => prev + emoji)}
          />

          {/* Input area */}
          <View style={styles.inputArea}>
            <CyberButton
              style={styles.emojiBtn}
              onPress={() => setShowEmoji(v => !v)}
            >
              <Text style={styles.emojiBtnText}>{showEmoji ? '⌨️' : '😊'}</Text>
            </CyberButton>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isAI ? 'Zapytaj AI...' : 'Wiadomość VEXTRO...'}
              placeholderTextColor="#444"
              multiline={false}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              onFocus={() => setShowEmoji(false)}
            />
            <CyberButton style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.btnText}>▶</Text>
            </CyberButton>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#B026FF',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  backBtnText: {
    color: '#B026FF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B026FF',
    marginRight: 10,
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSub: {
    color: '#555',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    shadowColor: '#00FF9C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  // Banners
  offlineBanner: {
    backgroundColor: 'rgba(255, 0, 60, 0.15)',
    borderBottomWidth: 1,
    borderColor: '#FF003C',
    paddingVertical: 6,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FF003C',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  e2eeBanner: {
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 6,
    backgroundColor: 'rgba(176, 38, 255, 0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(176, 38, 255, 0.2)',
    alignItems: 'center',
  },
  e2eeText: {
    color: '#555',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.8,
  },

  // Messages
  myMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#B026FF',
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 3,
    marginVertical: 4,
    maxWidth: '80%',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  otherMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 3,
    marginVertical: 4,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  msgText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontFamily: 'monospace',
  },

  // Typing
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 3,
    marginVertical: 4,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minWidth: 60,
    justifyContent: 'center',
  },

  // Scroll button
  scrollBtn: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#B026FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  scrollBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Input
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#151515',
    color: '#B026FF',
    borderRadius: 23,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    fontSize: 15,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 2,
  },
  emojiBtnText: { fontSize: 22 },
  sendBtn: {
    width: 46,
    height: 46,
    backgroundColor: '#B026FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 23,
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});