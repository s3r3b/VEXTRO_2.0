import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TextInput, 
  FlatList, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CyberButton from './CyberButton';



export default function NewChatModal({ visible, onClose, onContactSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedContacts, setSavedContacts] = useState([]);
  const [globalUsers, setGlobalUsers] = useState([]);
  
  // Tryb ręcznego dodawania nowego kontaktu
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContacts();
      loadGlobalUsers();
      setSearchQuery('');
      setIsAddingMode(false);
      setNewContactPhone('');
    }
  }, [visible]);

  const loadContacts = async () => {
    try {
      const contactsStr = await AsyncStorage.getItem('vextro_contacts');
      if (contactsStr) {
        setSavedContacts(JSON.parse(contactsStr));
      }
    } catch (e) {
      console.log('Error loading contacts:', e);
    }
  };

  const loadGlobalUsers = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/all`, {
        headers: {
          'bypass-tunnel-reminder': 'true'
        }
      });
      setGlobalUsers(response.data.users);
    } catch (error) {
      console.log('Error loading global users:', error);
    }
  };

  // Stub for creating a new group (future implementation)
  const handleCreateGroup = () => {
    Alert.alert('INFO', 'Funkcja tworzenia grupy jest w trakcie implementacji.');
  };

  const handleAddNewContact = async () => {
    if (!newContactPhone.trim()) return;
    setIsSearching(true);

    try {
      // Weryfikujemy użytkownika w bazie globalnej po numerze telefonu
      const response = await axios.get(`${SERVER_URL}/api/users/search/${newContactPhone.trim()}`);
      const user = response.data.user;

      const contactsStr = await AsyncStorage.getItem('vextro_contacts');
      let contacts = contactsStr ? JSON.parse(contactsStr) : [];

      if (!contacts.find(c => c.phoneNumber === user.phoneNumber)) {
        contacts.push({ ...user, name: user.name || `Node ${user.phoneNumber}` });
        await AsyncStorage.setItem('vextro_contacts', JSON.stringify(contacts));
        setSavedContacts(contacts);
        Alert.alert('SUKCES', 'Zapisano użytkownika w Twojej księdze VEXTRO.');
        setIsAddingMode(false);
      } else {
        Alert.alert('INFO', 'Pierścień sieci informuje, że ten użytkownik już tu jest.');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert('BŁĄD ZAPISU', 'Ten numer nie należy do nikogo w VEXTRO.');
      } else {
        Alert.alert('BŁĄD ZAPISU', 'Problem z łącznością serwera bazy.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Filtrowanie obu list w locie po searchQuery
  const filteredSaved = savedContacts.filter(
    c => (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) || c.phoneNumber.includes(searchQuery)
  );
  
  const filteredGlobal = globalUsers.filter(
    u => u.phoneNumber.includes(searchQuery) && !savedContacts.find(sc => sc.phoneNumber === u.phoneNumber)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.header}>
            <CyberButton onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✖</Text>
            </CyberButton>
            <Text style={styles.headerTitle}>NOWY KANAŁ</Text>
          </View>

          {/* MAIN SEARCH SECTION */}
          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              placeholder="Wyszukaj znajomego po nazwie..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {!isAddingMode ? (
             <View style={styles.actionsBox}>
               <CyberButton style={styles.actionItem} onPress={handleCreateGroup}>
                 <View style={styles.actionIcon}><Text>👥</Text></View>
                 <Text style={styles.actionText}>NOWA GRUPA SYSTEMOWA</Text>
               </CyberButton>
               
               <CyberButton style={styles.actionItem} onPress={() => setIsAddingMode(true)}>
                 <View style={styles.actionIcon}><Text>👤</Text></View>
                 <Text style={styles.actionText}>NOWY KONTAKT (DO VEXTRO)</Text>
               </CyberButton>
             </View>
          ) : (
             <View style={styles.addContactPanel}>
                <Text style={styles.sectionTitle}>SZYBKIE DODAWANIE WĘZŁA</Text>
                <View style={{flexDirection:'row', gap:10}}>
                   <TextInput
                     style={[styles.searchInput, {flex:1}]}
                     placeholder="Podaj dokładny numer / ID"
                     placeholderTextColor="#555"
                     value={newContactPhone}
                     onChangeText={setNewContactPhone}
                     keyboardType="phone-pad"
                   />
                   <CyberButton style={styles.saveBtn} onPress={handleAddNewContact}>
                     <Text style={styles.saveBtnText}>{isSearching ? "..." : "ZAPISZ"}</Text>
                   </CyberButton>
                </View>
                <CyberButton style={{marginTop: 10}} onPress={() => setIsAddingMode(false)}>
                   <Text style={{color: '#888', textAlign: 'center', fontSize: 12}}>[ ANULUJ DODAWANIE ]</Text>
                </CyberButton>
             </View>
          )}

          <FlatList
            style={styles.listArea}
            data={[
              { type: 'header', title: `TWOJE ZAPISANE KONTAKTY VEXTRO (${filteredSaved.length})` },
              ...filteredSaved.map(item => ({ ...item, type: 'saved' })),
              { type: 'header', title: `GLOBALNE WĘZŁY - INNI W VEXTRO (${filteredGlobal.length})` },
              ...filteredGlobal.map(item => ({ ...item, type: 'global' }))
            ]}
            keyExtractor={(item, index) => item.phoneNumber || `header-${index}`}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return <Text style={styles.sectionTitle}>{item.title}</Text>;
              }

              return (
                <CyberButton 
                  style={item.type === 'saved' ? styles.contactItemSaved : styles.contactItemGlobal}
                  onPress={() => {
                    onClose();
                    onContactSelect(item);
                  }}
                >
                  <View style={item.type === 'saved' ? styles.contactAvatarSaved : styles.contactAvatarGlobal}>
                    <Text>👤</Text>
                  </View>
                  <View>
                    <Text style={item.type === 'saved' ? styles.contactNameSaved : styles.contactNameGlobal}>
                      {item.name || 'GLOBAL NODE'}
                    </Text>
                    <Text style={styles.contactKey}>{item.phoneNumber}</Text>
                  </View>
                </CyberButton>
              );
            }}
          />

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  closeBtn: { width: 40, height: 40, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  closeBtnText: { color: '#FF003C', fontSize: 18, fontWeight: 'bold' },
  headerTitle: { color: '#B026FF', fontSize: 18, fontWeight: '900', letterSpacing: 2, marginLeft: 20, textShadowColor: '#B026FF', textShadowOffset: { width:0, height:0 }, textShadowRadius: 10 },
  
  searchSection: { padding: 15 },
  searchInput: { height: 50, backgroundColor: '#111', color: '#B026FF', paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontFamily: 'monospace' },
  
  addContactPanel: { marginHorizontal: 15, padding: 15, backgroundColor: 'rgba(176, 38, 255, 0.05)', borderRadius: 10, borderWidth: 1, borderColor: '#B026FF' },
  saveBtn: { width: 90, backgroundColor: '#B026FF', justifyContent: 'center', alignItems: 'center', borderRadius: 10, shadowColor: '#B026FF', shadowOffset: { width:0, height:0 }, shadowOpacity: 0.8, shadowRadius: 5 },
  saveBtnText: { color: '#121212', fontWeight: '900', letterSpacing: 1 },

  actionsBox: { paddingHorizontal: 15, paddingTop: 0 },
  actionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  
  listArea: { flex: 1, paddingHorizontal: 15 },
  sectionTitle: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10, marginTop: 15 },
  
  contactItemSaved: { flexDirection: 'row', padding: 15, backgroundColor: '#1A1A1A', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  contactAvatarSaved: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#B026FF' },
  contactNameSaved: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  contactItemGlobal: { flexDirection: 'row', padding: 15, backgroundColor: '#111', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  contactAvatarGlobal: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#555' },
  contactNameGlobal: { color: '#777', fontSize: 16, fontWeight: 'bold' },

  contactKey: { color: '#555', fontSize: 11, fontFamily: 'monospace', marginTop: 3 }
});
