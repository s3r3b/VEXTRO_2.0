import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CyberButton from '../components/CyberButton';
import NewChatModal from '../components/NewChatModal';

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  const loadContacts = async () => {
    try {
      const str = await AsyncStorage.getItem('vextro_contacts');
      if (str) {
        setContacts(JSON.parse(str));
      }
      // Load AI toggle state
      const aiFlag = await AsyncStorage.getItem('ai_enabled');
      setAiEnabled(aiFlag === 'true');
    } catch (e) {
      console.error("Błąd pobierania kontaktów", e);
    }
  };

  // Load contacts every time this screen becomes focused
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  const startChat = (contactTitle, contactPhone) => {
    navigation.navigate('Chat', { 
      title: contactTitle,
      phoneNumber: contactPhone
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 100 }}>
          {/* VEXTRO AI UNIT — widoczny tylko gdy AI jest włączone */}
          {aiEnabled && (
            <CyberButton 
              style={styles.contactItem} 
              onPress={() => startChat('VEXTRO AI', 'AI')}
            >
              <View style={styles.avatar}><Text style={{fontSize: 20}}>🤖</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>VEXTRO AI [BETA]</Text>
                <Text style={styles.statusOnline}>SYSTEM READY</Text>
              </View>
            </CyberButton>
          )}

          {/* LOKALNE KONTAKTY UŻYTKOWNIKA */}
          <Text style={styles.sectionHeader}>POŁĄCZENIA PRYWATNE</Text>
          
          {contacts.length === 0 ? (
            <Text style={styles.emptyText}>Brak zaszyfrowanych kontaktów. Użyj skanera w prawym dolnym rogu, aby je dodać.</Text>
          ) : (
            contacts.map((c) => (
              <CyberButton 
                key={c.phoneNumber}
                style={styles.contactItem} 
                onPress={() => startChat(c.name || `Chat: ${c.phoneNumber}`, c.phoneNumber)}
              >
                <View style={[styles.avatar, { borderColor: '#555', shadowColor: 'transparent', elevation: 0 }]}>
                  <Text style={{fontSize: 20}}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{c.name || 'NIEZNANY WĘZEŁ'}</Text>
                  <Text style={styles.lastMsg}>{c.phoneNumber}</Text>
                </View>
              </CyberButton>
            ))
          )}
        </ScrollView>

        {/* FLOATING ACTION BUTTON */}
        <View style={styles.fabContainer}>
          <CyberButton 
            style={styles.fab}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.fabIcon}>📇</Text>
          </CyberButton>
        </View>
      </View>

      <NewChatModal 
        visible={isModalVisible} 
        onClose={() => {
          setModalVisible(false);
          loadContacts();
        }}
        onContactSelect={(contact) => {
          startChat(contact.name || contact.phoneNumber, contact.phoneNumber);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#1A1A1A', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 2, borderColor: '#B026FF', shadowColor: '#B026FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5, elevation: 5 },
  contactName: { color: '#fff', fontWeight: 'bold', fontSize: 16, textShadowColor: '#fff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  statusOnline: { color: '#B026FF', fontSize: 11, fontWeight: 'bold', textShadowColor: '#B026FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  lastMsg: { color: '#888', fontSize: 12 },
  sectionHeader: { color: '#555', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10, marginTop: 10 },
  emptyText: { color: '#444', fontStyle: 'italic', textAlign: 'center', margin: 20, fontSize: 12 },
  
  fabContainer: {
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    zIndex: 9999,
  },
  fab: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#B026FF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#B026FF', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.8, 
    shadowRadius: 10, 
    elevation: 10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  fabIcon: { fontSize: 28, color: '#121212', fontWeight: '900', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width:0, height:0 }, textShadowRadius: 5 }
});