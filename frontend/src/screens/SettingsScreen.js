import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CyberButton from '../components/CyberButton';

export default function SettingsScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nickname, setNickname] = useState('GHOST');
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    // Odświeżenie przy każdym pojawieniu się ekranu
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
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const menuItems = [
    { icon: '🔑', label: 'Account', sub: 'Security notifications, change number', screen: 'Account' },
    { icon: '🔒', label: 'Privacy', sub: 'Block contacts, disappearing messages', screen: 'Privacy' },
    { icon: '💬', label: 'Chats', sub: 'Theme, wallpapers, chat history' },
    { icon: '🔔', label: 'Notifications', sub: 'Message, group & call tones' },
    { icon: '🔄', label: 'App Update', sub: 'Check for cyber-patches' },
    { icon: '🤖', label: 'AI with private API', sub: 'Configure private AI integration', screen: 'AISettings' },
    { icon: '🖥️', label: 'Linked Devices', sub: 'Scan QR to access VEXTRO Web', screen: 'QRScanner' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* PROFILE HEADER SECTION */}
        <CyberButton style={styles.profileSection} onPress={() => navigation.navigate('ProfileEdit')}>
          <View style={styles.profileInfoRow}>
            {profilePhoto ? (
               <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
            ) : (
               <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>👤</Text></View>
            )}
            <View style={styles.nameContainer}>
              <Text style={styles.nickname}>{nickname}</Text>
              <Text style={styles.phoneLabel}>{phoneNumber}</Text>
              <Text style={styles.statusLabel}>Online / Encrypted</Text>
            </View>
            <CyberButton style={styles.qrIconWrapper} onPress={() => navigation.navigate('QRScanner')}>
              <Text style={styles.qrIcon}>🔳</Text>
            </CyberButton>
          </View>
        </CyberButton>

        {/* SETTINGS LIST */}
        <View style={styles.settingsList}>
          {menuItems.map((item, index) => (
            <CyberButton key={index} style={styles.menuItem} onPress={() => item.screen ? navigation.navigate(item.screen) : null}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
            </CyberButton>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <CyberButton style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>[ TERMINATE CONNECTION ]</Text>
        </CyberButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  profileSection: { backgroundColor: '#1A1A1A', padding: 20, borderBottomWidth: 1, borderBottomColor: '#B026FF', shadowColor: '#B026FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, marginBottom: 20 },
  profileInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatarImg: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#B026FF' },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#B026FF', shadowColor: '#B026FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },
  avatarText: { fontSize: 24 },
  nameContainer: { flex: 1, marginLeft: 15 },
  nickname: { color: '#fff', fontSize: 20, fontWeight: 'bold', textShadowColor: '#fff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  phoneLabel: { color: '#B026FF', fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  statusLabel: { color: '#888', fontSize: 10, marginTop: 2, fontFamily: 'monospace' },
  qrIconWrapper: { padding: 10, justifyContent: 'center', alignItems: 'center' },
  qrIcon: { fontSize: 28, color: '#B026FF', textShadowColor: '#B026FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  settingsList: { paddingHorizontal: 15, marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#222' },
  menuIconContainer: { width: 40, alignItems: 'center' },
  menuIcon: { fontSize: 22 },
  menuTextContainer: { flex: 1, marginLeft: 15 },
  menuLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  menuSub: { color: '#666', fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  logoutBtn: { marginHorizontal: 20, marginTop: 20, marginBottom: 40, height: 50, backgroundColor: 'rgba(255, 0, 60, 0.1)', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#FF003C', shadowColor: '#FF003C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  logoutBtnText: { color: '#FF003C', fontWeight: '900', letterSpacing: 2, textShadowColor: '#FF003C', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }
});