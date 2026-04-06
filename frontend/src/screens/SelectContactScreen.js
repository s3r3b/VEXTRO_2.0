import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, X, UserPlus, Users, ChevronRight, Phone, AlertCircle, ArrowLeft
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import ScaledText from '../components/ScaledText';
import ContactsService from '../services/ContactsService';

export default function SelectContactScreen({ navigation }) {
  const [myPhone, setMyPhone] = useState('');
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Stan dla podłączonego wcześniej AddContactModal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadContacts = useCallback(async (phone) => {
    setIsLoading(true);
    const result = await ContactsService.getCachedContacts(); // Używamy cache'a dla optymalizacji, bo to Select Screen
    if (result && result.length > 0) {
      setContacts(result);
    } else {
      const live = await ContactsService.getContacts(phone);
      setContacts(live);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      if (phone) {
        setMyPhone(phone);
        await loadContacts(phone);
      }
    };
    init();
  }, [loadContacts]);

  const filteredContacts = contacts.filter(c =>
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPhone?.includes(searchQuery)
  );

  const renderContact = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        // Zastępuje ten ekran Chatem, żeby po powrocie z chatu nie wracał na listę "wyboru nowej wiadomości"
        navigation.replace('Chat', {
          title: item.displayName || item.contactPhone,
          phoneNumber: item.contactPhone,
          remotePublicKey: item.publicKey || null,
        });
      }}
      activeOpacity={0.7}
      style={styles.contactWrapper}
    >
      <GlassView intensity={10} style={styles.contactCard}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.contactInfo}>
          <ScaledText style={styles.contactName} numberOfLines={1}>
            {item.displayName || item.contactPhone}
          </ScaledText>
          <ScaledText style={styles.contactPhoneSub} numberOfLines={1}>
            {item.contactPhone}
          </ScaledText>
        </View>
        <ChevronRight size={18} color={VextroTheme.surfaceBorder} />
      </GlassView>
    </TouchableOpacity>
  );

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backBtn}
      >
        <ArrowLeft color={VextroTheme.text} size={24} />
      </TouchableOpacity>
      <View style={styles.headerTexts}>
        <ScaledText style={styles.headerTitle}>NOWA KOMUNIKACJA</ScaledText>
        <ScaledText style={styles.headerSubtitle}>
          {contacts.length} {contacts.length === 1 ? 'WĘZEŁ' : 'WĘZŁÓW'} W SIECI
        </ScaledText>
      </View>
    </View>
  );

  return (
    <CyberBackground>
      <SafeAreaView style={styles.container}>
        <Header />

        <View style={styles.searchSection}>
          <GlassView intensity={15} style={styles.searchBar}>
            <Search size={18} color={VextroTheme.textMuted} style={{ marginRight: 12 }} />
            <TextInput
              placeholder="SZUKAJ..."
              placeholderTextColor={VextroTheme.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor={VextroTheme.primary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={VextroTheme.textMuted} />
              </TouchableOpacity>
            )}
          </GlassView>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(191,0,255,0.15)' }]}>
              <Users size={20} color={VextroTheme.primary} />
            </View>
            <Text style={styles.actionText}>NOWA GRUPA</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => setIsModalOpen(true)}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0,240,255,0.15)' }]}>
              <UserPlus size={20} color={VextroTheme.accent} />
            </View>
            <Text style={styles.actionText}>NOWY KONTAKT</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>KONTAKTY VEXTRO</Text>

        {isLoading ? (
          <ActivityIndicator color={VextroTheme.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={item => item._id || item.contactPhone}
            renderItem={renderContact}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </SafeAreaView>

      <AddContactModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        myPhone={myPhone}
        onAdded={() => {
          ContactsService.getContacts(myPhone).then(setContacts);
        }}
        navigation={navigation}
      />
    </CyberBackground>
  );
}

// ─── MODAL DODAWANIA KONTAKTU (przeniesiony z ContactsScreen) ─────────────
function AddContactModal({ visible, onClose, myPhone, onAdded, navigation }) {
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setPhone('');
    setNickname('');
    setStatus(null);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = async () => {
    if (!phone.trim()) {
      setErrorMsg('Podaj numer telefonu.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const result = await ContactsService.addContact(
      myPhone,
      phone.trim(),
      nickname.trim() || phone.trim()
    );

    if (result.success) {
      setStatus('success');
      onAdded();
      setTimeout(() => {
        handleClose();
        // WhatsApp behavior: when you add a new contact, it stays on screen, but here
        // if they want to jump straight into chat:
        navigation.replace('Chat', {
          title: nickname.trim() || phone.trim(),
          phoneNumber: phone.trim(),
        });
      }, 800);
    } else {
      setStatus('error');
      setErrorMsg(result.error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
        <GlassView style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <UserPlus size={20} color={VextroTheme.primary} />
              <Text style={styles.modalTitle}>NOWY WĘZEŁ</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <X size={22} color={VextroTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Podaj numer telefonu zarejestrowany w sieci VEXTRO.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NUMER TELEFONU</Text>
            <View style={styles.inputRow}>
              <Phone size={16} color={VextroTheme.primary} style={{ marginRight: 10 }} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+48 000 000 000"
                placeholderTextColor={VextroTheme.textMuted}
                style={styles.modalInput}
                keyboardType="phone-pad"
                selectionColor={VextroTheme.primary}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PSEUDONIM (opcjonalny)</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="np. KLAUDIUSZ"
                placeholderTextColor={VextroTheme.textMuted}
                style={[styles.modalInput, { flex: 1 }]}
                selectionColor={VextroTheme.primary}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {status === 'error' && (
            <View style={styles.errorBanner}>
              <AlertCircle size={14} color={VextroTheme.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {status === 'success' && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ KONTAKT DODANY DO SIECI</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleAdd} style={styles.addBtn} disabled={status === 'loading' || status === 'success'} activeOpacity={0.8}>
            <LinearGradient colors={[VextroTheme.primary, VextroTheme.secondary]} style={styles.addBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {status === 'loading' ? <ActivityIndicator color={VextroTheme.background} size="small" /> : <Text style={styles.addBtnText}>NAWIĄŻ POŁĄCZENIE</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </GlassView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  headerTexts: { flex: 1 },
  headerTitle: {
    color: VextroTheme.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: VextroTheme.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
    letterSpacing: 1,
  },
  searchSection: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    color: VextroTheme.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionText: {
    color: VextroTheme.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    color: VextroTheme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  contactWrapper: { marginBottom: 12 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: { fontSize: 20 },
  contactInfo: { flex: 1, marginLeft: 16 },
  contactName: {
    color: VextroTheme.text,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactPhoneSub: {
    color: VextroTheme.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  
  // MODAL STYLING (copied from target design system)
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalCard: { borderRadius: 28, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: 28, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalTitle: { color: VextroTheme.text, fontSize: 18, fontWeight: '900', letterSpacing: 2, marginLeft: 10 },
  modalSubtitle: { color: VextroTheme.textMuted, fontSize: 11, marginBottom: 24, lineHeight: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: VextroTheme.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(191,0,255,0.2)', borderRadius: 14, paddingHorizontal: 14, height: 52 },
  modalInput: { flex: 1, color: VextroTheme.text, fontSize: 14, fontWeight: '600' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,0,85,0.08)', borderWidth: 1, borderColor: 'rgba(255,0,85,0.2)', borderRadius: 10, padding: 12, marginBottom: 16, gap: 8 },
  errorText: { color: VextroTheme.error, fontSize: 11, fontWeight: '700', flex: 1 },
  successBanner: { backgroundColor: 'rgba(0,240,100,0.08)', borderWidth: 1, borderColor: 'rgba(0,240,100,0.2)', borderRadius: 10, padding: 12, marginBottom: 16, alignItems: 'center' },
  successText: { color: '#00f064', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  addBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  addBtnGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: VextroTheme.background, fontWeight: '900', fontSize: 12, letterSpacing: 2 },
});
