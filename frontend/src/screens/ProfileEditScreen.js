// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/ProfileEditScreen.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  SafeAreaView, Image, ScrollView, Alert, KeyboardAvoidingView, 
  Platform, StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import { 
  VxProfileIcon, 
  VxSecurityIcon, 
  VxRadarIcon, 
  VxInterfaceIcon 
} from '../components/ui/icons/static';
import { VxPurgeIcon } from '../components/ui/icons/kinetic';
import * as Haptics from 'expo-haptics';

import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';

/**
 * VEXTRO 3.0 IDENTITY EDITOR
 * Profesjonalny edytor tożsamości - aliasy, awatary i klucze publiczne (QR).
 */
export default function ProfileEditScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      if (phone) setPhoneNumber(phone);
      
      const storedNick = await AsyncStorage.getItem('userNickname');
      if (storedNick) setNickname(storedNick);

      const storedPhoto = await AsyncStorage.getItem('profilePhoto');
      if (storedPhoto) setProfilePhoto(storedPhoto);
    };
    loadProfile();
  }, []);

  const handleSaveNickname = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('userNickname', nickname);
    Alert.alert("IDENTITY SYNCED", "Your ghost alias has been propagated through the network.");
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = result.assets[0].uri;
      setProfilePhoto(uri);
      await AsyncStorage.setItem('profilePhoto', uri);
    }
  };

  const handleRemoveImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProfilePhoto(null);
    await AsyncStorage.removeItem('profilePhoto');
  };

  const qrValue = JSON.stringify({
    v: '3.0',
    id: phoneNumber,
    n: nickname || 'GHOST'
  });

  return (
    <CyberBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >          <ScrollView contentContainerStyle={styles.scroll}>
            
            {/* 3.0 AVATAR HUD */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handlePickImage} style={styles.avatarCircle}>
                 <View style={styles.identityRing} />
                 {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
                 ) : (
                    <View style={styles.avatarPlaceholder}>
                       <VxSecurityIcon size={48} color={VextroTheme.primary} opacity={0.3} />
                    </View>
                 )}
                 <View style={styles.editBadge}>
                    <VxInterfaceIcon size={14} color={VextroTheme.background} />
                 </View>
              </TouchableOpacity>
              
              {profilePhoto && (
                <TouchableOpacity onPress={handleRemoveImage} style={styles.removeBtn}>
                  <VxPurgeIcon size={12} color={VextroTheme.error} style={{marginRight: 6}} shaking={false} />
                  <Text style={styles.removeText}>PURGE AVATAR DATA</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* IDENTITY INPUTS */}
            <GlassView style={styles.formCard}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>GHOST ALIAS / PUBLIC ID</Text>
                    <View style={styles.inputRow}>
                        <TextInput 
                            style={styles.input}
                            value={nickname}
                            onChangeText={setNickname}
                            placeholder="Enter Identity Alias..."
                            placeholderTextColor={VextroTheme.textMuted}
                            selectionColor={VextroTheme.primary}
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNickname}>
                            <VxProfileIcon size={20} color={VextroTheme.background} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                    <Text style={styles.label}>TERMINAL ADDRESS (READ-ONLY)</Text>
                    <View style={styles.readOnlyBox}>
                        <Text style={styles.readOnlyText}>{phoneNumber || 'SEARCHING NODE...'}</Text>
                        <VxSecurityIcon size={14} color={VextroTheme.accent} />
                    </View>
                </View>
            </GlassView>

            {/* IDENTITY SHARING (QR) */}
            <View style={styles.qrSection}>
                <View style={styles.qrHeader}>
                    <VxRadarIcon size={16} color={VextroTheme.primary} style={{marginRight: 8}} />
                    <Text style={styles.qrHeaderTitle}>IDENTITY HANDSHAKE</Text>
                </View>
                <GlassView intensity={10} style={styles.qrBox}>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={qrValue}
                            size={160}
                            color={VextroTheme.primary}
                            backgroundColor="transparent"
                        />
                    </View>
                    <Text style={styles.qrSub}>
                        Show this node signature to establish a peer-to-peer encrypted connection.
                    </Text>
                </GlassView>
            </View>

            <Text style={styles.footer}>VEXTRO ID PROTOCOL v3.0 // AES-256 BIT</Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, alignItems: 'center' },
  avatarSection: { marginVertical: 32, alignItems: 'center' },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  identityRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(191, 0, 255, 0.2)',
    borderRadius: 45,
    borderStyle: 'dashed',
  },
  avatarImg: { width: 110, height: 110, borderRadius: 38 },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.1)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: VextroTheme.primary,
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#040b14',
  },
  removeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  removeText: { color: VextroTheme.error, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  formCard: { width: '100%', padding: 24 },
  inputGroup: { marginBottom: 24 },
  label: { color: VextroTheme.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  inputRow: { flexDirection: 'row' },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: VextroTheme.text,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.1)',
  },
  saveBtn: {
    width: 52,
    height: 52,
    backgroundColor: VextroTheme.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: VextroTheme.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  readOnlyBox: {
    height: 52,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  readOnlyText: { color: '#666', fontSize: 13, fontFamily: 'monospace' },
  qrSection: { width: '100%', marginTop: 32 },
  qrHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginLeft: 4 },
  qrHeaderTitle: { color: VextroTheme.text, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  qrBox: { padding: 32, alignItems: 'center' },
  qrContainer: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.1)',
  },
  qrSub: { 
    color: VextroTheme.textMuted, 
    fontSize: 10, 
    textAlign: 'center', 
    lineHeight: 16, 
    marginTop: 24,
    opacity: 0.7 
  },
  footer: { marginTop: 40, color: VextroTheme.textMuted, fontSize: 8, letterSpacing: 2, opacity: 0.4 },
});
