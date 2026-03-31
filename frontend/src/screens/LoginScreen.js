// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, Alert, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendSms = () => {
    if (phoneNumber.length < 9) return Alert.alert("BŁĄD", "NIEPRAWIDŁOWY FORMAT NUMERU");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSmsSent(true);
    }, 1000);
  };

  const handleVerify = async () => {
    if (smsCode === '1234') {
      await AsyncStorage.setItem('userPhone', phoneNumber);
      navigation.replace('Main'); // Przejście do stacku głównego
    } else {
      Alert.alert("ACCESS DENIED", "BŁĘDNY KOD WERYFIKACYJNY");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authBox}>
        <Text style={styles.logo}>VEXTRO</Text>
        <Text style={styles.label}>{isSmsSent ? "WPISZ KOD (MOCK: 1234)" : "IDENTYFIKACJA URZĄDZENIA"}</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder={isSmsSent ? "KOD" : "+48..."}
          placeholderTextColor="#444"
          keyboardType="phone-pad"
          value={isSmsSent ? smsCode : phoneNumber}
          onChangeText={isSmsSent ? setSmsCode : setPhoneNumber}
          maxLength={isSmsSent ? 4 : 15}
        />

        <TouchableOpacity style={styles.btn} onPress={isSmsSent ? handleVerify : handleSendSms}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isSmsSent ? "AUTORYZUJ" : "GENERUJ KOD"}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  authBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logo: { fontSize: 50, fontWeight: '900', color: '#B026FF', letterSpacing: 5, marginBottom: 40, textShadowColor: '#B026FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },
  label: { color: '#888', marginBottom: 15, fontSize: 10, letterSpacing: 2, textShadowColor: '#888', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  input: { width: '100%', height: 55, backgroundColor: '#1A1A1A', color: '#B026FF', borderRadius: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: '#B026FF', fontSize: 18, textAlign: 'center', shadowColor: '#B026FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 5 },
  btn: { width: '100%', height: 55, backgroundColor: '#B026FF', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 20, shadowColor: '#B026FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 10 },
  btnText: { color: '#121212', fontWeight: '900', letterSpacing: 2, fontSize: 16 }
});