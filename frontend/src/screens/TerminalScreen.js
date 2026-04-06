import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, View, Text, TextInput, ScrollView, 
  TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Terminal as TerminalIcon, X, Send, Trash2, Cpu } from 'lucide-react-native';
import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import NetworkConfig from '../services/NetworkConfig';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TerminalScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    const initTerminal = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      const newSocket = io(NetworkConfig.getSocketUrl());
      
      newSocket.on('connect', () => {
        setLogs(prev => [...prev, { type: 'system', text: '📡 [CONNECTED] VEXTRO_GOD_MODE_ACTIVE' }]);
        newSocket.emit('request_terminal', { phoneNumber: phone });
      });

      newSocket.on('terminal_output', (data) => {
        setLogs(prev => [...prev, { type: 'output', text: data }]);
      });

      newSocket.on('terminal_error', (data) => {
        setLogs(prev => [...prev, { type: 'error', text: `🛑 [ERROR] ${data.error}` }]);
      });

      newSocket.on('terminal_exit', (data) => {
        setLogs(prev => [...prev, { type: 'system', text: `⌛ [TERMINATED] Exit Code: ${data.exitCode}` }]);
      });

      setSocket(newSocket);
    };

    initTerminal();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    socket.emit('terminal_input', input + '\n');
    setInput('');
  };

  const clearTerminal = () => setLogs([]);

  return (
    <CyberBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Cpu color={VextroTheme.primary} size={18} />
              <Text style={styles.headerTitle}>GOD_MODE_TERMINAL</Text>
            </View>
            <View style={styles.headerActions}>
               <TouchableOpacity onPress={clearTerminal} style={styles.iconBtn}>
                <Trash2 color={VextroTheme.textMuted} size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                <X color={VextroTheme.text} size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terminal Area */}
          <GlassView intensity={10} style={styles.terminalBody}>
            <ScrollView 
              ref={scrollViewRef}
              style={styles.logContainer}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {logs.map((log, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.logEntry,
                    log.type === 'system' && styles.logSystem,
                    log.type === 'error' && styles.logError
                  ]}
                >
                  {log.text}
                </Text>
              ))}
            </ScrollView>
          </GlassView>

          {/* Input Area */}
          <View style={styles.inputWrapper}>
            <Text style={styles.prompt}>$</Text>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              placeholder="ENTER COMMAND..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
              selectionColor={VextroTheme.primary}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
              <Send color={VextroTheme.primary} size={20} />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191, 0, 255, 0.1)',
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: {
    color: VextroTheme.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: VextroTheme.primaryGlow,
    textShadowRadius: 8,
  },
  headerActions: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 5 },
  terminalBody: {
    flex: 1,
    margin: 15,
    borderRadius: 15,
    padding: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.05)',
  },
  logContainer: { flex: 1 },
  logEntry: {
    color: '#00ff41', // Klasyczny zielony terminal
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  logSystem: { color: VextroTheme.accent },
  logError: { color: '#ff3131' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0a1e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 0, 255, 0.2)',
  },
  prompt: {
    color: VextroTheme.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: VextroTheme.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    height: 40,
  },
  sendBtn: {
    padding: 10,
  }
});
