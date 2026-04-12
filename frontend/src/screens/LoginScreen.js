// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  VxNeuralIcon,
  VxRadarIcon,
  VxSecurityIcon
} from '../components/ui/icons/static';
import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import { useShield } from '../context/ShieldContext';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import NetworkConfig from '../services/NetworkConfig';
import axios from 'axios';

/**
 * VEXTRO 3.0 AUTHENTICATION
 * Transformacja wizualna na standard Premium Sync (1:1 Web Mirror).
 */
export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { identity, isReady } = useShield();

  const handleSendSms = () => {
    if (phoneNumber.length < 9) return Alert.alert("ERROR", "INVALID PHONE FORMAT");
    setLoading(true);
    // Symulacja szyfrowanego połączenia
    setTimeout(() => {
      setLoading(false);
      setIsSmsSent(true);
    }, 1200);
  };

  const handleVerify = async () => {
    try {
      setLoading(true);

      // LOGOWANIE AUDYTORE (Tylko dla Seniora)
      console.log('📡 [VEXTRO_AUTH] Próba synchronizacji tożsamości...');
      console.log(`- Phone: ${phoneNumber}`);
      console.log(`- Code length: ${smsCode.length}`);
      console.log(`- Shield Ready: ${isReady}`);
      console.log(`- Public Key: ${identity?.publicKey ? 'PRESENT' : 'MISSING'}`);

      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

      if (!identity?.publicKey) {
        Alert.alert("SECURE BOOT", "Klucze kryptograficzne są jeszcze generowane. Spróbuj ponownie za kilka sekund.");
        setLoading(false);
        return;
      }

      if (!smsCode || smsCode.length < 4) {
        Alert.alert("AUTH FAILED", "Wprowadź poprawny 4-cyfrowy kod zabezpieczający.");
        setLoading(false);
        return;
      }

      // 1. Pobranie adresu Hub
      const authUrl = `${NetworkConfig.getSocketUrl()}/api/auth/verify-code`;

      // 2. Rejestracja/Weryfikacja na Backendzie
      await axios.post(authUrl, {
        phoneNumber: cleanPhone,
        code: smsCode, // Mapowanie pass_8*** na 'code'
        publicKey: identity.publicKey
      }, {
        timeout: 5000
      });

      await AsyncStorage.setItem('userPhone', cleanPhone);
      console.log('✅ Identity synchronized with VEXTRO Hub');

      navigation.replace('Main');
    } catch (err) {
      console.error('❌ Błąd krytyczny autoryzacji:', err.response?.data || err.message);
      const debugPath = `${NetworkConfig.getSocketUrl()}/api/auth/verify-code`;
      Alert.alert(
        "IDENTITY_FAILURE_HUB",
        `ERROR: ${err.response?.data?.error || err.message}\n\nTarget: ${debugPath}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CyberBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.header}>
              <View style={styles.iconRing}>
                <VxNeuralIcon size={32} color={VextroTheme.primary} />
              </View>
              <Text style={styles.logo}>VEXTRO</Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('QRScanner')}
                style={styles.scanBadge}
              >
                <VxRadarIcon size={12} color={VextroTheme.accent} />
                <Text style={styles.scanBadgeText}>TARGET_HUB_DISCOVERY</Text>
              </TouchableOpacity>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>SECURE TERMINAL ACTIVE</Text>
              </View>
            </View>

            <GlassView style={styles.authBox}>
              <Text style={styles.label}>
                {isSmsSent ? "ENTER AUTH CODE (MOCK: 1234)" : "IDENTITY VERIFICATION"}
              </Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={isSmsSent ? "0000" : "+48 000 000 000"}
                  placeholderTextColor={VextroTheme.textMuted}
                  keyboardType="phone-pad"
                  value={isSmsSent ? smsCode : phoneNumber}
                  onChangeText={isSmsSent ? setSmsCode : setPhoneNumber}
                  maxLength={isSmsSent ? 4 : 15}
                  selectionColor={VextroTheme.primary}
                />
              </View>

              <TouchableOpacity
                style={styles.btn}
                onPress={isSmsSent ? handleVerify : handleSendSms}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={VextroTheme.background} />
                ) : (
                  <View style={styles.btnContent}>
                    <VxSecurityIcon size={20} color={VextroTheme.background} />
                    <Text style={styles.btnText}>
                      {isSmsSent ? "AUTHORIZE" : "GENERATE ENCRYPTION KEY"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </GlassView>

            {/* Sync QR Shortcut - Just like on Web */}
            {!isSmsSent && (
              <TouchableOpacity
                style={styles.syncBtn}
                onPress={() => navigation.navigate('QRScanner')}
                activeOpacity={0.7}
              >
                <VxRadarIcon size={18} color={VextroTheme.accent} />
                <Text style={styles.syncBtnText}>FAST SYNC (QR SCAN)</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.footer}>
              END-TO-END ENCRYPTED DECENTRALIZED NETWORK v.3.0
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: VextroTheme.surfaceBorder,
    backgroundColor: 'rgba(15, 10, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: VextroTheme.primary,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: VextroTheme.text,
    letterSpacing: 4,
    textShadowColor: VextroTheme.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VextroTheme.accent,
    marginRight: 6,
    shadowColor: VextroTheme.accent,
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  statusText: {
    color: VextroTheme.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  scanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
    marginTop: 12,
  },
  scanBadgeText: {
    color: VextroTheme.accent,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 8,
    textTransform: 'uppercase'
  },
  authBox: { padding: 32, width: '100%' },
  label: {
    color: VextroTheme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: VextroTheme.surfaceBorder,
  },
  input: {
    width: '100%',
    height: 48,
    color: VextroTheme.primary,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  btn: {
    width: '100%',
    height: 56,
    backgroundColor: VextroTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: VextroTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: VextroTheme.background, fontWeight: '900', letterSpacing: 2, fontSize: 13, marginLeft: 8 },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 12,
    alignSelf: 'center',
  },
  syncBtnText: {
    color: VextroTheme.accent,
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 11,
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: VextroTheme.textMuted,
    fontSize: 8,
    letterSpacing: 2,
    opacity: 0.5,
  }
});