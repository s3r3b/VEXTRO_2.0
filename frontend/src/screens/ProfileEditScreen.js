import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';

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
    await AsyncStorage.setItem('userNickname', nickname);
    Alert.alert("IDENTITY UPDATED", "Your new alias has been saved in the system.");
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // using new API correctly for expo-image-picker v15+ is mediaTypes: ImagePicker.MediaTypeOptions.Images, but 'images' still works as alias or fallback if legacy. Let's use robust mode below.
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePhoto(uri);
      await AsyncStorage.setItem('profilePhoto', uri);
    }
  };

  const handleRemoveImage = async () => {
    setProfilePhoto(null);
    await AsyncStorage.removeItem('profilePhoto');
  };

  const qrValue = JSON.stringify({
    vextro_user: true,
    phone: phoneNumber,
    nick: nickname || 'GHOST'
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>👤</Text></View>
            )}
            <View style={styles.editBadge}><Text style={{fontSize: 12}}>✏️</Text></View>
          </TouchableOpacity>
          {profilePhoto && (
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>[ REMOVE AVATAR ]</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* IDENTITY SECTION */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ALIAS / NICKNAME</Text>
          <View style={styles.inputRow}>
            <TextInput 
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter Ghost Alias..."
              placeholderTextColor="#555"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNickname}>
              <Text style={styles.saveBtnText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TERMINAL ID (PHONE)</Text>
          <TextInput 
            style={[styles.input, { color: '#888', backgroundColor: '#111', borderColor: '#222' }]}
            value={phoneNumber}
            editable={false}
          />
        </View>

        {/* QR CODE SECTION */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>SHARE IDENTITY</Text>
          <Text style={styles.qrSub}>Show this QR code to another node to establish an E2EE connection.</Text>
          <View style={styles.qrBox}>
             {phoneNumber ? (
               <QRCode
                 value={qrValue}
                 size={180}
                 color="#B026FF"
                 backgroundColor="#1A1A1A"
               />
             ) : (
               <Text style={{color: '#888'}}>GENERATING...</Text>
             )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  avatarSection: { alignItems: 'center', marginVertical: 30 },
  avatarWrapper: { position: 'relative' },
  avatarImg: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#B026FF' },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#B026FF', shadowColor: '#B026FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15 },
  avatarText: { fontSize: 50 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#B026FF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#121212' },
  removeBtn: { marginTop: 15 },
  removeBtnText: { color: '#FF003C', fontSize: 12, fontWeight: 'bold', textShadowColor: '#FF003C', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  inputGroup: { width: '100%', marginBottom: 25 },
  label: { color: '#B026FF', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8, textShadowColor: '#B026FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, height: 50, backgroundColor: '#1A1A1A', color: '#fff', borderRadius: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: '#B026FF', fontSize: 16 },
  saveBtn: { width: 80, height: 50, backgroundColor: '#B026FF', justifyContent: 'center', alignItems: 'center', borderRadius: 8, shadowColor: '#B026FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 5 },
  saveBtnText: { color: '#121212', fontWeight: '900' },
  qrSection: { width: '100%', alignItems: 'center', marginTop: 10, padding: 20, backgroundColor: '#1A1A1A', borderRadius: 15, borderWidth: 1, borderColor: '#333' },
  qrTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5, letterSpacing: 2 },
  qrSub: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 20, fontFamily: 'monospace' },
  qrBox: { padding: 10, backgroundColor: '#1A1A1A', borderRadius: 10, borderWidth: 2, borderColor: '#B026FF', shadowColor: '#B026FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 }
});
