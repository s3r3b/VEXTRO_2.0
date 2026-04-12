// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, SafeAreaView, ScrollView, 
  Image, TouchableOpacity, StatusBar, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  VxProfileIcon, 
  VxSecurityIcon, 
  VxInterfaceIcon, 
  VxNeuralIcon, 
  VxExitIcon, 
  VxBackIcon,
  VxShortcutIcon,
  VxRadarIcon
} from '../components/ui/icons/static';
import { VxGearIcon } from '../components/ui/icons/kinetic';
import * as Haptics from 'expo-haptics';

import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';

/**
 * VEXTRO 3.0 SETTINGS DASHBOARD
 * Futurystyczny interfejs konfiguracji terminala.
 * Ikony Lucide służą jako placeholder pod Twoje własne pakiety ikon VEXTRO.
 */
export default function SettingsScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nickname, setNickname] = useState('GHOST');
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
    
    const unsubscribe = navigation.addListener('focus', loadProfile);
    loadProfile();
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const SettingItem = ({ icon: Icon, label, sub, screen, color = VextroTheme.text }) => (
    <TouchableOpacity 
      style={styles.itemWrapper} 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (screen) navigation.navigate(screen);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.itemIconContainer}>
        {typeof Icon === 'function' ? <Icon size={20} color={color} /> : Icon}
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemSub}>{sub}</Text>
      </View>
      <VxBackIcon size={16} color={VextroTheme.surfaceBorder} style={{ transform: [{ rotate: '180deg' }] }} />
    </TouchableOpacity>
  );

  return (
    <CyberBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* 3.0 IDENTITY CARD */}
          <GlassView style={styles.profileCard}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ProfileEdit')}
              style={styles.profileRow}
            >
              <View style={styles.avatarWrapper}>
                {profilePhoto ? (
                   <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
                ) : (
                   <View style={styles.avatarPlaceholder}>
                      <VxProfileIcon size={30} color={VextroTheme.primary} />
                   </View>
                )}
                <View style={styles.onlineBadge} />
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.nickname}>{nickname}</Text>
                <Text style={styles.phoneLabel}>{phoneNumber}</Text>
                <View style={styles.securityBadge}>
                    <VxSecurityIcon size={12} color={VextroTheme.accent} />
                    <Text style={styles.securityText}>IDENTITY VERIFIED</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.qrBtn}
                onPress={() => navigation.navigate('QRScanner')}
              >
                <VxRadarIcon size={24} color={VextroTheme.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          </GlassView>

          {/* SETTINGS GROUPS */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>CORE SECURITY</Text>
            <GlassView intensity={10} style={styles.groupCard}>
                <SettingItem 
                    icon={VxSecurityIcon} 
                    label="Account Security" 
                    sub="Biometrics, 2FA, session control" 
                    screen="Account"
                    color={VextroTheme.accent}
                />
                <View style={styles.divider} />
                <SettingItem 
                    icon={VxSecurityIcon} 
                    label="Privacy & Encryption" 
                    sub="E2EE protocols, disappearing logs" 
                    screen="Privacy"
                    color={VextroTheme.accent}
                />
            </GlassView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>INTERFACE & DATA</Text>
            <GlassView intensity={10} style={styles.groupCard}>
                <SettingItem 
                    icon={VxInterfaceIcon} 
                    label="Interface Synthesis" 
                    sub="Typography, wallpapers, terminal physics" 
                    screen="InterfaceSynthesis"
                    color={VextroTheme.primary}
                />
                <View style={styles.divider} />
                <SettingItem icon={VxInterfaceIcon} label="Notifications" sub="Neon pulse, priority alerts" />
                <View style={styles.divider} />
                <SettingItem 
                    icon={VxShortcutIcon} 
                    label="Linked Devices" 
                    sub="Active VEXTRO Web sessions" 
                    screen="QRScanner"
                    color={VextroTheme.primary}
                />
            </GlassView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>EXPERIMENTAL</Text>
            <GlassView intensity={10} style={styles.groupCard}>
                <SettingItem 
                    icon={VxNeuralIcon} 
                    label="VEXTRO AI Integration" 
                    sub="Private LLM endpoint configuration" 
                    screen="AISettings"
                    color={VextroTheme.primary}
                />
                <View style={styles.divider} />
                <SettingItem icon={VxGearIcon} label="System Update" sub="Check for node patches" />
            </GlassView>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <VxExitIcon size={18} color={VextroTheme.error} />
              <Text style={styles.logoutText}>TERMINATE SESSION</Text>
          </TouchableOpacity>

          <Text style={styles.versionInfo}>VEXTRO OS CORE v3.0.0-PROD</Text>

        </ScrollView>
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  profileCard: { padding: 20, marginBottom: 32 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { position: 'relative' },
  avatarImg: { width: 66, height: 66, borderRadius: 22, borderWidth: 1, borderColor: VextroTheme.primary },
  avatarPlaceholder: { 
    width: 66, 
    height: 66, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.2)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: VextroTheme.success,
    borderWidth: 3,
    borderColor: '#040b14',
  },
  profileMeta: { flex: 1, marginLeft: 16 },
  nickname: { color: VextroTheme.text, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  phoneLabel: { color: VextroTheme.primary, fontSize: 11, fontWeight: '800', marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  securityText: { color: VextroTheme.accent, fontSize: 7, fontWeight: '900', marginLeft: 4, letterSpacing: 1 },
  qrBtn: { padding: 10 },
  section: { marginBottom: 24 },
  sectionHeader: { 
    color: VextroTheme.textMuted, 
    fontSize: 9, 
    fontWeight: '800', 
    letterSpacing: 2, 
    marginBottom: 12, 
    marginLeft: 4,
    opacity: 0.7
  },
  groupCard: { paddingHorizontal: 16, borderRadius: 20 },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTextContainer: { flex: 1 },
  itemLabel: { color: VextroTheme.text, fontSize: 14, fontWeight: '700' },
  itemSub: { color: VextroTheme.textMuted, fontSize: 10, marginTop: 4, opacity: 0.8 },
  divider: { height: 1, backgroundColor: 'rgba(191, 0, 255, 0.1)', marginLeft: 56 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.2)',
    backgroundColor: 'rgba(255, 0, 85, 0.03)',
  },
  logoutText: { color: VextroTheme.error, fontWeight: '900', fontSize: 12, letterSpacing: 2, marginLeft: 12 },
  versionInfo: { 
    textAlign: 'center', 
    color: VextroTheme.textMuted, 
    fontSize: 8, 
    marginTop: 40, 
    letterSpacing: 2,
    opacity: 0.4
  }
});
