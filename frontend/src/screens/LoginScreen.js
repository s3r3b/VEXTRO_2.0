// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/LoginScreen.js
/**
 * VEXTRO 3.0 ATOMIC E2EE AUTHENTICATION
 * Two modes: CREATE ACCOUNT (with X3DH bundle) & LOGIN (existing account)
 *
 * Protocol: ATOMIC_E2EE_REGISTRATION_PROTOCOL
 * Date: 2026-04-13
 */

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
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
import axios from 'axios';
import NetworkConfig from '../services/NetworkConfig';
import cryptoCore from '../utils/cryptoCore';
import StorageManager from '../utils/StorageManager';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null | 'register' | 'login'
  const [errorMessage, setErrorMessage] = useState('');

  const { identity, isReady } = useShield();

  const handleSendSms = () => {
    if (phoneNumber.length < 9) {
      Alert.alert("ERROR", "INVALID PHONE FORMAT");
      return;
    }
    setLoading(true);
    // Mock SMS (in production: real SMS service)
    setTimeout(() => {
      setLoading(false);
      setIsSmsSent(true);
      setErrorMessage('');
    }, 1200);
  };

  /**
   * ATOMIC REGISTRATION FLOW
   * One HTTP request, one transaction, all keys or nothing
   */
  const handleAtomicRegister = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      console.log('🔐 [AUTH] ATOMIC_REGISTRATION_START');

      // 1. Validate inputs
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      if (smsCode.length < 4) {
        Alert.alert("AUTH FAILED", "Invalid verification code");
        setLoading(false);
        return;
      }

      // 2. ATOMIC: Clear localStorage BEFORE generating new keys
      console.log('🧹 [AUTH] Clearing previous keys...');
      await StorageManager.clear();

      // 3. Generate X3DH bundle (Ed25519 identity + Curve25519 SPK + 50 OTPKs)
      console.log('🔑 [AUTH] Generating X3DH bundle...');
      const { bundle, localKeys } = cryptoCore.generateX3DHBundle();

      // 4. ATOMIC POST /api/auth/register with FULL bundle
      console.log('📡 [AUTH] Sending atomic registration request...');
      const apiBase = NetworkConfig.getApiBase();
      const response = await axios.post(`${apiBase}/auth/register`, {
        phoneNumber: cleanPhone,
        code: smsCode,
        publicKey: bundle.identityKey,
        signedPreKey: bundle.signedPreKey,
        oneTimePreKeys: bundle.oneTimePreKeys
      }, {
        timeout: 10000
      });

      console.log('✅ [AUTH] Registration successful, user created with all keys');

      // 5. ONLY on success: persist locally
      console.log('💾 [AUTH] Persisting keys locally...');
      await StorageManager.setUserPhone(cleanPhone);
      await StorageManager.setX3DHKeys(localKeys);
      await StorageManager.setIdentityPublic(bundle.identityKey);

      // 6. Store private identity key in SecureStore (SENSITIVE)
      await SecureStore.setItemAsync('vextro_identity_private', localKeys.identityKeyPriv);

      console.log('✅ [AUTH] ATOMIC_REGISTRATION_COMPLETE');
      setIsSmsSent(false);
      setSmsCode('');
      navigation.replace('Main');

    } catch (err) {
      console.error('❌ [AUTH] ATOMIC_REGISTRATION_FAILED:', err.response?.data || err.message);

      // ON ERROR: Atomic cleanup (CRITICAL for preventing partial state)
      console.log('🧹 [AUTH] ERROR: Cleaning up on registration failure...');
      await StorageManager.clear();

      const errorMsg = err.response?.data?.error || err.message;
      if (err.response?.status === 409) {
        Alert.alert(
          "PHONE_EXISTS",
          "This phone number is already registered. Use LOGIN instead."
        );
      } else {
        Alert.alert("REGISTRATION_FAILED", errorMsg);
      }
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * LOGIN FLOW (existing account)
   * Only verifies phone + code, retrieves existing keys from localStorage
   */
  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      console.log('📡 [AUTH] LOGIN_START');

      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      if (smsCode.length < 4) {
        Alert.alert("AUTH FAILED", "Invalid verification code");
        setLoading(false);
        return;
      }

      // 1. POST /api/auth/login (no bundle, just verification)
      const apiBase = NetworkConfig.getApiBase();
      const response = await axios.post(`${apiBase}/auth/login`, {
        phoneNumber: cleanPhone,
        code: smsCode
      }, {
        timeout: 10000
      });

      console.log('✅ [AUTH] Login successful');

      // 2. Verify that we have existing keys (should be in localStorage from previous registration)
      const existingKeys = await StorageManager.getX3DHKeys();
      if (!existingKeys) {
        Alert.alert("ERROR", "No encryption keys found. Please CREATE ACCOUNT first.");
        return;
      }

      // 3. Update phone in storage (may have changed)
      await StorageManager.setUserPhone(cleanPhone);

      console.log('✅ [AUTH] LOGIN_COMPLETE');
      setIsSmsSent(false);
      setSmsCode('');
      navigation.replace('Main');

    } catch (err) {
      console.error('❌ [AUTH] LOGIN_FAILED:', err.response?.data || err.message);

      const errorMsg = err.response?.data?.error || err.message;
      if (err.response?.status === 401) {
        Alert.alert("LOGIN_FAILED", "Invalid phone or verification code.");
      } else {
        Alert.alert("LOGIN_FAILED", errorMsg);
      }
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Choose between register or login
  const handleVerify = () => {
    if (authMode === 'register') {
      handleAtomicRegister();
    } else if (authMode === 'login') {
      handleLogin();
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

            {/* Mode Selection (Only if not in auth flow) */}
            {!isSmsSent && !authMode && (
              <GlassView style={styles.authBox}>
                <Text style={styles.label}>SELECT MODE</Text>

                <TouchableOpacity
                  style={[styles.modeBtn, styles.modeBtnPrimary]}
                  onPress={() => {
                    setAuthMode('register');
                    setPhoneNumber('');
                    setSmsCode('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modeBtnText}>CREATE ACCOUNT</Text>
                  <Text style={styles.modeBtnSubtext}>Generate new X3DH keys</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeBtn, styles.modeBtnSecondary]}
                  onPress={() => {
                    setAuthMode('login');
                    setPhoneNumber('');
                    setSmsCode('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modeBtnText}>EXISTING ACCOUNT</Text>
                  <Text style={styles.modeBtnSubtext}>Use stored keys</Text>
                </TouchableOpacity>
              </GlassView>
            )}

            {/* Auth Flow (Phone/Code Entry) */}
            {authMode && (
              <GlassView style={styles.authBox}>
                <View style={styles.modeHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setAuthMode(null);
                      setPhoneNumber('');
                      setSmsCode('');
                      setIsSmsSent(false);
                      setErrorMessage('');
                    }}
                    style={styles.backBtn}
                  >
                    <Text style={styles.backBtnText}>← BACK</Text>
                  </TouchableOpacity>
                  <Text style={styles.modeLabel}>
                    {authMode === 'register' ? 'CREATE ACCOUNT' : 'LOGIN'}
                  </Text>
                </View>

                <Text style={styles.label}>
                  {isSmsSent ? "ENTER AUTH CODE (MOCK: 1234)" : "PHONE NUMBER"}
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
                    editable={!loading}
                  />
                </View>

                {errorMessage ? (
                  <Text style={styles.errorText}>❌ {errorMessage}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnDisabled]}
                  onPress={isSmsSent ? handleVerify : handleSendSms}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={VextroTheme.background} />
                  ) : (
                    <View style={styles.btnContent}>
                      <VxSecurityIcon size={20} color={VextroTheme.background} />
                      <Text style={styles.btnText}>
                        {isSmsSent
                          ? (authMode === 'register' ? "REGISTER" : "LOGIN")
                          : "SEND CODE"
                        }
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </GlassView>
            )}

            <Text style={styles.footer}>
              ATOMIC E2EE REGISTRATION v3.0
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
  authBox: { padding: 32, width: '100%', marginBottom: 24 },
  label: {
    color: VextroTheme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.1)',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtnText: {
    color: VextroTheme.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  modeLabel: {
    flex: 1,
    textAlign: 'center',
    color: VextroTheme.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  modeBtn: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBtnPrimary: {
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    borderColor: 'rgba(191, 0, 255, 0.3)',
  },
  modeBtnSecondary: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  modeBtnText: {
    color: VextroTheme.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  modeBtnSubtext: {
    color: VextroTheme.textMuted,
    fontSize: 9,
    marginTop: 4,
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
    height: 52,
    backgroundColor: VextroTheme.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: VextroTheme.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    color: VextroTheme.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginLeft: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    color: VextroTheme.textMuted,
    fontSize: 8,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 24,
    fontWeight: '700',
  },
});
