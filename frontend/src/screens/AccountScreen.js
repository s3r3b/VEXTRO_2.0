import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  Switch, 
  Modal, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CyberButton from '../components/CyberButton';

export default function AccountScreen({ navigation }) {
  // States na ustawienia
  const [pinEnabled, setPinEnabled] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  
  // States na modale i UI 
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [terminateModalVisible, setTerminateModalVisible] = useState(false);
  const [terminateInput, setTerminateInput] = useState('');
  
  const [dumping, setDumping] = useState(false);

  // Wczytanie początkowe stanu
  useEffect(() => {
    const loadSettings = async () => {
      const storedPinFlag = await AsyncStorage.getItem('twofa_enabled');
      const storedAlertsFlag = await AsyncStorage.getItem('security_alerts');
      
      setPinEnabled(storedPinFlag === 'true');
      setAlertsEnabled(storedAlertsFlag === 'true');
    };
    loadSettings();
  }, []);

  // Obsługa przełącznika PIN
  const togglePin = async (value) => {
    if (value) {
      setPinInput('');
      setPinModalVisible(true);
    } else {
      setPinEnabled(false);
      await AsyncStorage.setItem('twofa_enabled', 'false');
      await AsyncStorage.removeItem('twofa_pin');
      Alert.alert('TERMINAL', 'Autoryzacja dwuetapowa została wyłączona.');
    }
  };

  const savePin = async () => {
    if (pinInput.length < 4) {
      Alert.alert('BŁĄD ZABEZPIECZEŃ', 'Kod PIN musi mieć min. 4 cyfry.');
      return;
    }
    await AsyncStorage.setItem('twofa_enabled', 'true');
    await AsyncStorage.setItem('twofa_pin', pinInput);
    setPinEnabled(true);
    setPinModalVisible(false);
    Alert.alert('SYSTEM ZABEZPIECZONY', 'Nowy Terminal PIN został zaszyfrowany i zapisany w bazie pamięci.');
  };

  // Obsługa przełącznika Alertów Bezpieczeństwa
  const toggleAlerts = async (value) => {
    setAlertsEnabled(value);
    await AsyncStorage.setItem('security_alerts', value.toString());
  };

  // Intel Dump 
  const requestIntelDump = async () => {
    setDumping(true);
    setTimeout(async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const data = await AsyncStorage.multiGet(keys);
        
        const dumpObj = data.reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        
        setDumping(false);
        // Na realnym urządzeniu można podpiąć system plików do zapisu pliku
        Alert.alert(
          '💽 Zrzut Danych (INTEL DUMP) Pomyślny', 
          `Odczytano dane z węzła w sieci VEXTRO.\n\nZgrano lokalnych kluczy: ${keys.length}\nFormat: ZASZYFROWANY JSON.`,
          [{ text: 'ZAMKNIJ RAPORT', style: 'default' }]
        );
      } catch(e) {
        setDumping(false);
        Alert.alert('BŁĄD', 'Zrzut pamięci węzła zakończył się niepowodzeniem.');
      }
    }, 2000); // 2-sekundowe sztuczne opóźnienie (animacja)
  };

  // Obsługa Terminate Protocol
  const executeTerminateProtocol = async () => {
    if (terminateInput === 'DELETE') {
      setTerminateModalVisible(false);
      await AsyncStorage.clear();
      Alert.alert('TERMINATE PROTOCOL', 'Dane wymazane. Węzeł nie istnieje w sieci VEXTRO.');
      navigation.replace('Login');
    } else {
      Alert.alert('ODMOWA DOSTĘPU', 'Podano nieprawidłową sekwencję samozniszczenia!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
            <Text style={styles.title}>KONFIGURACJA WĘZŁA</Text>
            <Text style={styles.subtitle}>Zarządzaj tożsamością w sieci VEXTRO</Text>
        </View>

        {/* 1. 2FA (Terminal PIN) */}
        <View style={styles.settingBlock}>
          <View style={styles.settingRow}>
            <View style={{flex: 1}}>
              <Text style={styles.settingLabel}>Terminal PIN (Autoryzacja 2FA)</Text>
              <Text style={styles.settingDesc}>Zabezpiecz apkę przy ponownym połączeniu.</Text>
            </View>
            <Switch 
              value={pinEnabled} 
              onValueChange={togglePin} 
              trackColor={{ false: '#333', true: '#B026FF' }}
              thumbColor={pinEnabled ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* 2. Security Alerts */}
        <View style={styles.settingBlock}>
          <View style={styles.settingRow}>
            <View style={{flex: 1}}>
              <Text style={styles.settingLabel}>Alerty Sieciowe (Security Net)</Text>
              <Text style={styles.settingDesc}>Sprawdzaj transparentność kluczy kontaktów w sieci.</Text>
            </View>
            <Switch 
              value={alertsEnabled} 
              onValueChange={toggleAlerts} 
              trackColor={{ false: '#333', true: '#00FF9C' }}
              thumbColor={alertsEnabled ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* 3. Change Alias (STUB) */}
        <CyberButton 
          style={styles.actionBlock} 
          onPress={() => Alert.alert('W TRAKCIE ANALIZY', 'Serwery centralne chwilowo odrzucają migrację. Powróć tu wkrótce.')}
        >
          <Text style={styles.actionLabel}>🔀 Zmień Identyfikację Węzła</Text>
          <Text style={styles.settingDesc}>Przenieś wszystkie dane na inny kanał VEXTRO MASK.</Text>
        </CyberButton>

        {/* 4. Intel Dump */}
        <CyberButton 
          style={styles.actionBlock} 
          onPress={requestIntelDump}
          disabled={dumping}
        >
           {dumping ? (
             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <ActivityIndicator color="#B026FF"/>
               <Text style={[styles.actionLabel, { marginLeft: 10, color: '#B026FF' }]}>ZGRYWANIE PAMIĘCI KANAŁU...</Text>
             </View>
           ) : (
             <View>
               <Text style={styles.actionLabel}>📂 Intel Dump (Eksport Rekordów)</Text>
               <Text style={styles.settingDesc}>Ściągnij całą aktywność konta zapisaną lokalnie.</Text>
             </View>
           )}
        </CyberButton>

        {/* 5. Terminate Protocol */}
        <CyberButton 
          style={styles.dangerBlock} 
          onPress={() => {
            setTerminateInput('');
            setTerminateModalVisible(true);
          }}
        >
          <Text style={styles.dangerLabel}>⚠️ INITIATE TERMINATE PROTOCOL</Text>
          <Text style={styles.dangerDesc}>Trwale kasuje połączenie, tożsamość węzła i logi. Self-destruct.</Text>
        </CyberButton>

      </ScrollView>

      {/* MODAL 2FA PIN */}
      <Modal animationType="slide" transparent={true} visible={pinModalVisible}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>USTAW NOWY KOD SYSTEMU</Text>
             <Text style={styles.modalDesc}>Od teraz logowanie wymaga potwierdzenia PINem wirtualnej matrycy.</Text>
             
             <TextInput
               style={styles.pinInput}
               keyboardType="numeric"
               maxLength={6}
               secureTextEntry
               autoFocus
               placeholder="1 2 3 4"
               placeholderTextColor="#555"
               value={pinInput}
               onChangeText={setPinInput}
             />
             
             <View style={styles.modalActions}>
                <View style={{ flex: 1 }}>
                  <CyberButton style={[styles.modalBtn, { backgroundColor: '#111' }]} onPress={() => { setPinModalVisible(false); setPinEnabled(false); }}>
                    <Text style={[styles.modalBtnText, { color: '#888' }]}>ANULUJ</Text>
                  </CyberButton>
                </View>
                <View style={{ flex: 1 }}>
                  <CyberButton style={[styles.modalBtn, { backgroundColor: '#B026FF' }]} onPress={savePin}>
                    <Text style={[styles.modalBtnText, { color: '#121212' }]}>WGRAJ KLUCZ</Text>
                  </CyberButton>
                </View>
             </View>
          </View>
        </View>
      </Modal>

      {/* MODAL TERMINATE PROTOCOL */}
      <Modal animationType="fade" transparent={true} visible={terminateModalVisible}>
        <View style={[styles.modalBg, { backgroundColor: 'rgba(255,0,0,0.85)' }]}>
          <View style={[styles.modalContent, { borderColor: '#121212', backgroundColor: '#0A0A0A' }]}>
             <Text style={[styles.modalTitle, { color: '#FF003C', textShadowColor: '#FF003C' }]}>⚠️ AUTORYZACJA PROTOKOŁU USUNIĘCIA</Text>
             <Text style={styles.modalDesc}>Przeprowadzasz całkowitą utratę danych. Napisz słowo krytyczne <Text style={{fontWeight: 'bold', color: '#fff'}}>DELETE</Text> by zatwierdzić wymazanie węzła.</Text>
             
             <TextInput
               style={[styles.pinInput, { borderColor: '#FF003C', textShadowColor: '#FF003C' }]}
               autoCapitalize="characters"
               placeholder="WPISZ 'DELETE'"
               placeholderTextColor="#555"
               value={terminateInput}
               onChangeText={setTerminateInput}
             />
             
             <View style={styles.modalActions}>
                <View style={{ flex: 1 }}>
                  <CyberButton style={[styles.modalBtn, { backgroundColor: '#1A1A1A', borderColor: '#555' }]} onPress={() => setTerminateModalVisible(false)}>
                    <Text style={[styles.modalBtnText, { color: '#aaa' }]}>PRZERWIJ</Text>
                  </CyberButton>
                </View>
                <View style={{ flex: 1 }}>
                  <CyberButton style={[styles.modalBtn, { backgroundColor: 'rgba(255, 0, 60, 0.15)', borderColor: '#FF003C' }]} onPress={executeTerminateProtocol}>
                    <Text style={[styles.modalBtnText, { color: '#FF003C', textShadowColor: '#FF003C' }]}>POTWIERDŹ</Text>
                  </CyberButton>
                </View>
             </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#222', marginBottom: 15 },
  title: { color: '#B026FF', fontSize: 20, fontWeight: '900', letterSpacing: 2, textShadowColor: '#B026FF', textShadowOffset: { width:0, height:0 }, textShadowRadius: 8 },
  subtitle: { color: '#666', fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  
  settingBlock: { backgroundColor: '#111', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#222' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  settingDesc: { color: '#777', fontSize: 12, fontFamily: 'monospace', marginTop: 5 },

  actionBlock: { backgroundColor: '#1A1A1A', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  actionLabel: { color: '#00FF9C', fontSize: 16, fontWeight: 'bold' },

  dangerBlock: { backgroundColor: 'rgba(255, 0, 60, 0.05)', marginHorizontal: 15, marginTop: 10, marginBottom: 30, padding: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 0, 60, 0.3)' },
  dangerLabel: { color: '#FF003C', fontSize: 16, fontWeight: '900', letterSpacing: 1, textShadowColor: '#FF003C', textShadowOffset: { width:0, height:0 }, textShadowRadius: 5 },
  dangerDesc: { color: '#aaa', fontSize: 12, fontFamily: 'monospace', marginTop: 5 },

  // Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#111', padding: 25, borderRadius: 12, borderWidth: 1, borderColor: '#B026FF', shadowColor: '#B026FF', shadowRadius: 15, shadowOpacity: 0.3 },
  modalTitle: { color: '#B026FF', fontSize: 18, fontWeight: '900', letterSpacing: 1, textShadowColor: '#B026FF', textShadowOffset: { width:0, height:0 }, textShadowRadius: 5 },
  modalDesc: { color: '#aaa', fontSize: 12, fontFamily: 'monospace', marginTop: 10, marginBottom: 20, lineHeight: 18 },
  pinInput: { height: 60, backgroundColor: '#000', borderRadius: 8, borderWidth: 1, borderColor: '#B026FF', color: '#fff', fontSize: 24, paddingHorizontal: 20, textAlign: 'center', letterSpacing: 10, fontWeight: 'bold', fontFamily: 'monospace', textShadowColor: '#fff', textShadowOffset: { width:0, height:0 }, textShadowRadius: 5 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginTop: 25 },
  modalBtn: { height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  modalBtnText: { fontWeight: '900', letterSpacing: 1 }
});
