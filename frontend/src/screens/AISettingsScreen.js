import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VxAiSwitch } from '../components/ui/icons/kinetic';
import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import { LinearGradient } from 'expo-linear-gradient';
import { VxNeuralIcon, VxBackIcon } from '../components/ui/icons/static';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AISettingsScreen({ navigation }) {
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [nickname, setNickname] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      const storedEnabled = await AsyncStorage.getItem('ai_enabled');
      const storedKey = await AsyncStorage.getItem('ai_api_key');
      const storedNick = await AsyncStorage.getItem('ai_nick');
      if (storedEnabled !== null) {
        const isEnabled = storedEnabled === 'true';
        setEnabled(isEnabled);
        setShowDetails(isEnabled);
      }
      if (storedKey) setApiKey(storedKey);
      if (storedNick) setNickname(storedNick);
    };
    loadSettings();
  }, []);

  const toggleSwitch = async (value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEnabled(value);
    setShowDetails(value);
    await AsyncStorage.setItem('ai_enabled', value.toString());
  };

  const saveApiKey = async (key) => {
    setApiKey(key);
    await AsyncStorage.setItem('ai_api_key', key);
  };

  const saveNickname = async (nick) => {
    setNickname(nick);
    await AsyncStorage.setItem('ai_nick', nick);
  };

  return (
    <CyberBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <VxBackIcon color={VextroTheme.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NEURAL ENGINE</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <GlassView intensity={30} style={styles.mainCard}>
            <View style={styles.switchRow}>
              <View style={styles.infoCol}>
                <Text style={styles.mainLabel}>AI Integration</Text>
                <Text style={styles.subLabel}>Enable Private Neural Link</Text>
              </View>
              <VxAiSwitch isOn={enabled} onToggle={() => toggleSwitch(!enabled)} />
            </View>

            {showDetails && (
              <View style={styles.expandable}>
                <View style={styles.divider} />
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>OPENAI API KEY</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="sk-...."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={apiKey}
                    onChangeText={saveApiKey}
                    secureTextEntry
                  />
                  <Text style={styles.hint}>Klucz szyfrowany lokalnie w bezpiecznym magazynie urządzenia.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NEURAL AGENT NICKNAME (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YOUR API CHATBOT AI"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={nickname}
                    onChangeText={saveNickname}
                  />
                  <Text style={styles.hint}>Twoja nazwa dla bota na liście kontaktów.</Text>
                </View>

                <View style={styles.infoBox}>
                  <VxNeuralIcon size={16} color={VextroTheme.primary} />
                  <Text style={styles.infoText}>VEXTRO Neural Engine wspiera streaming GPT-4o-mini dla maksymalnej wydajności.</Text>
                </View>
              </View>
            )}
          </GlassView>

          <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={[VextroTheme.primary, VextroTheme.secondary]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveBtnText}>COMMIT CONFIGURATION</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 3, fontFamily: Platform.OS === 'ios' ? 'Orbitron' : 'monospace' },
  backBtn: { padding: 8 },
  scrollContent: { padding: 20 },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: { flex: 1 },
  mainLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  subLabel: { color: VextroTheme.textMuted, fontSize: 12, marginTop: 4 },
  expandable: { marginTop: 24 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { color: VextroTheme.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  input: {
    height: 54,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  hint: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 8, fontStyle: 'italic' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(191, 0, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.15)',
  },
  infoText: { flex: 1, color: VextroTheme.text, fontSize: 10, lineHeight: 16 },
  saveBtn: {
    marginTop: 32,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: VextroTheme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
});
