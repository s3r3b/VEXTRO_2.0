import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  Switch, 
  Modal,
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CyberButton from '../components/CyberButton';

export default function PrivacyScreen({ navigation }) {
  // Switche w pamięci
  const [ghostMode, setGhostMode] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [neuralShield, setNeuralShield] = useState(false);

  // Auto-Wipe (Samoznikające wiadomości)
  const [wipeModalVisible, setWipeModalVisible] = useState(false);
  const [wipeTimer, setWipeTimer] = useState('OFF'); // OFF, 24H, 7D, BURN

  useEffect(() => {
    const loadSettings = async () => {
      const storedGhost = await AsyncStorage.getItem('privacy_ghost');
      const storedReceipts = await AsyncStorage.getItem('privacy_receipts');
      const storedShield = await AsyncStorage.getItem('privacy_shield');
      const storedWipe = await AsyncStorage.getItem('privacy_wipe');

      // Defaultowo włączone są zazwyczaj readReceipts
      setGhostMode(storedGhost === 'true');
      if (storedReceipts !== null) setReadReceipts(storedReceipts === 'true');
      setNeuralShield(storedShield === 'true');
      if (storedWipe) setWipeTimer(storedWipe);
    };
    loadSettings();
  }, []);

  const toggleGhost = async (value) => {
    setGhostMode(value);
    await AsyncStorage.setItem('privacy_ghost', value.toString());
    if (value) {
      Alert.alert('GHOST MODE AKTYWNY', 'Od teraz Twój status łączności w sieci jest całkowicie zamaskowany (OFFLINE dla reszty węzłów).');
    }
  };

  const toggleReceipts = async (value) => {
    setReadReceipts(value);
    await AsyncStorage.setItem('privacy_receipts', value.toString());
  };

  const toggleShield = async (value) => {
    setNeuralShield(value);
    await AsyncStorage.setItem('privacy_shield', value.toString());
    if (value) {
      Alert.alert('NEURAL SHIELD', 'Zabezpieczenie przed podsłuchem graficznym UI i skanerami ekranu uruchomione pomyślnie. Screenshoty zostaną zablokowane.');
    }
  };

  const setWipeTime = async (timeMode) => {
    setWipeTimer(timeMode);
    await AsyncStorage.setItem('privacy_wipe', timeMode);
    setWipeModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
            <Text style={styles.title}>PARAMETRY CIENIA</Text>
            <Text style={styles.subtitle}>Dopasuj protokoły ukrywające Twój cyfrowy ślad.</Text>
        </View>

        {/* 1. Ghost Mode */}
        <View style={styles.settingBlock}>
          <View style={styles.settingRow}>
            <View style={{flex: 1}}>
              <Text style={styles.settingLabel}>Ghost Mode (Tryb Ducha)</Text>
              <Text style={styles.settingDesc}>Zamaskowanie statusu online. Będziesz widoczny tylko jako wyblakły log.</Text>
            </View>
            <Switch 
              value={ghostMode} 
              onValueChange={toggleGhost} 
              trackColor={{ false: '#222', true: '#B026FF' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* 2. Disappearing Messages */}
        <CyberButton 
          style={styles.actionBlock} 
          onPress={() => setWipeModalVisible(true)}
        >
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
             <View style={{flex: 1}}>
                <Text style={[styles.actionLabel, { color: '#00FF9C' }]}>Auto-Wipe (Rozpad Wiadomości)</Text>
                <Text style={styles.settingDesc}>Aktywuje niszczenie Twoich nowych wiadomości po odczycie w wyznaczonym czasie.</Text>
             </View>
             <View style={styles.valueBadge}>
                <Text style={styles.valueBadgeText}>{wipeTimer}</Text>
             </View>
          </View>
        </CyberButton>

        {/* 3. Read Receipts */}
        <View style={styles.settingBlock}>
          <View style={styles.settingRow}>
            <View style={{flex: 1}}>
              <Text style={styles.settingLabel}>Sygnalizacja Odczytu (Intel Signatures)</Text>
              <Text style={styles.settingDesc}>Wysyłaj odbiorcy zwrotny ping (fioletowe ≡), gdy zobaczysz pakiety.</Text>
            </View>
            <Switch 
              value={readReceipts} 
              onValueChange={toggleReceipts} 
              trackColor={{ false: '#222', true: '#B026FF' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* 4. Neural Shield */}
        <View style={styles.settingBlock}>
          <View style={styles.settingRow}>
            <View style={{flex: 1}}>
              <Text style={styles.settingLabel}>Neural Shield (Anty-Screenshot)</Text>
              <Text style={styles.settingDesc}>Wymuszaj SECURE_FLAG zabraniający systemowi operacyjnemu sczytywanie podglądu tej aplikacji.</Text>
            </View>
            <Switch 
              value={neuralShield} 
              onValueChange={toggleShield} 
              trackColor={{ false: '#222', true: '#00FF9C' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* 5. Blacklist */}
        <CyberButton 
          style={styles.actionBlock} 
          onPress={() => Alert.alert('BLACKLIST', 'Węzły na tej liście zostały odłączone od kanału bezterminowo. (Aktualnie limit zablokowanych: 0)')}
        >
          <View>
            <Text style={[styles.actionLabel, { color: '#FF003C' }]}>⚠️ Zakazane Węzły (Blacklist)</Text>
            <Text style={styles.settingDesc}>Zarządzaj odciętymi kontaktami, blokuj lub zdejmuj blokady sieciowe.</Text>
          </View>
        </CyberButton>

      </ScrollView>

      {/* MODAL DO WYBORU AUTO-WIPE */}
      <Modal animationType="slide" transparent={true} visible={wipeModalVisible}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>TOLERANCJA ARCHIWIZACJI [WIPE]</Text>
             <Text style={styles.modalDesc}>Od teraz nowe rozmowy samoczynnie będą niszczone w tym oknie czasowym.</Text>
             
             <View style={{gap: 15, marginBottom: 25}}>
                <CyberButton style={[styles.radioBtn, wipeTimer === 'OFF' && styles.radioActive]} onPress={() => setWipeTime('OFF')}>
                   <Text style={[styles.radioText, wipeTimer === 'OFF' && styles.radioTextActive]}>[ STABILIZACJA ] NIGDY NIE KASUJ</Text>
                </CyberButton>

                <CyberButton style={[styles.radioBtn, wipeTimer === '24H' && styles.radioActive]} onPress={() => setWipeTime('24H')}>
                   <Text style={[styles.radioText, wipeTimer === '24H' && styles.radioTextActive]}>[ ROTACJA ] KASUJ PO 24 GODZINACH</Text>
                </CyberButton>

                <CyberButton style={[styles.radioBtn, wipeTimer === '7D' && styles.radioActive]} onPress={() => setWipeTime('7D')}>
                   <Text style={[styles.radioText, wipeTimer === '7D' && styles.radioTextActive]}>[ RETENCJA ] KASUJ PO 7 DNIACH</Text>
                </CyberButton>

                <CyberButton style={[styles.radioBtn, wipeTimer === 'BURN' && styles.radioBurnActive]} onPress={() => setWipeTime('BURN')}>
                   <Text style={[styles.radioText, wipeTimer === 'BURN' && styles.radioBurnTextActive]}>[🔥 BURN ON READ] NATYCHMIAST</Text>
                </CyberButton>
             </View>

             <CyberButton style={[styles.modalBtn, { backgroundColor: '#1A1A1A' }]} onPress={() => setWipeModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: '#888' }]}>ZWIŃ INTERFEJS</Text>
             </CyberButton>
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
  actionLabel: { color: '#B026FF', fontSize: 16, fontWeight: 'bold' },

  valueBadge: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 5, borderWidth: 1, borderColor: '#555', marginLeft: 10 },
  valueBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },

  // Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#111', padding: 25, borderRadius: 12, borderWidth: 1, borderColor: '#333', shadowColor: '#B026FF', shadowRadius: 10, shadowOpacity: 0.2 },
  modalTitle: { color: '#00FF9C', fontSize: 18, fontWeight: '900', letterSpacing: 1, textShadowColor: '#00FF9C', textShadowOffset: { width:0, height:0 }, textShadowRadius: 5 },
  modalDesc: { color: '#aaa', fontSize: 12, fontFamily: 'monospace', marginTop: 10, marginBottom: 25, lineHeight: 18 },
  
  radioBtn: { backgroundColor: '#0A0A0A', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#222' },
  radioActive: { backgroundColor: 'rgba(176, 38, 255, 0.1)', borderColor: '#B026FF' },
  radioText: { color: '#666', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  radioTextActive: { color: '#B026FF', textShadowColor: '#B026FF', textShadowOffset: { width:0, height:0 }, textShadowRadius: 5 },

  radioBurnActive: { backgroundColor: 'rgba(255, 0, 60, 0.1)', borderColor: '#FF003C' },
  radioBurnTextActive: { color: '#FF003C', textShadowColor: '#FF003C', textShadowOffset: { width:0, height:0 }, textShadowRadius: 5 },

  modalBtn: { height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  modalBtnText: { fontWeight: '900', letterSpacing: 2 }
});
