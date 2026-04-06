import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Search, X, Check, Users, ShieldCheck
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import ScaledText from '../components/ScaledText';
import ContactsService from '../services/ContactsService';
import NetworkConfig from '../services/NetworkConfig';
import { useShield } from '../context/ShieldContext';
import axios from 'axios';

export default function CreateGroupScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  
  // Tryby: 'SELECT_MEMBERS' | 'SET_GROUP_NAME'
  const [mode, setMode] = useState('SELECT_MEMBERS'); 
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { generateGroupKeyAndEnvelopes, identity } = useShield();

  useEffect(() => {
    const fetchContacts = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      if (phone) {
        const result = await ContactsService.getCachedContacts();
        if (result && result.length > 0) {
          setContacts(result);
        } else {
          const live = await ContactsService.getContacts(phone);
          setContacts(live);
        }
      }
      setIsLoading(false);
    };
    fetchContacts();
  }, []);

  const toggleContact = (phone) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedContacts(newSelected);
  };

  const handleNext = () => {
    if (mode === 'SELECT_MEMBERS' && selectedContacts.size > 0) {
      setMode('SET_GROUP_NAME');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedContacts.size === 0) return;
    setIsCreating(true);

    try {
      const myPhone = await AsyncStorage.getItem('userPhone');
      
      // Przygotowanie puli użytkowników (w tym admina) do wygenerowania na nich kopert z kluczem
      const membersList = [{ phone: myPhone, publicKey: identity.publicKey }];
      
      contacts.forEach(c => {
        if (selectedContacts.has(c.contactPhone) && c.publicKey) {
          membersList.push({ phone: c.contactPhone, publicKey: c.publicKey });
        }
      });

      // Zastosowanie Cryptography Handshake
      const { groupSecretKey, envelopes } = await generateGroupKeyAndEnvelopes(membersList);

      // Skonstruowanie paczki dla Backend (API)
      const res = await axios.post(`${NetworkConfig.BASE_URL}/api/groups/create`, {
        groupName: groupName.trim(),
        adminPhone: myPhone,
        members: envelopes // Envelopes zawierają phone, encryptedKey oraz nonce
      });

      if (res.status === 201) {
        alert("🛡️ Grupa E2EE została skonstruowana!");
        navigation.popToTop(); // Powrót na stronę główną
      }

    } catch (err) {
      console.error('❌ Błąd Inicjacji Grupy:', err);
      alert('Nie udało się ustanowić wieloosobowego tunelu krypto.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPhone?.includes(searchQuery)
  );

  const renderContact = ({ item }) => {
    const isSelected = selectedContacts.has(item.contactPhone);

    return (
      <TouchableOpacity
        onPress={() => toggleContact(item.contactPhone)}
        activeOpacity={0.7}
        style={styles.contactWrapper}
      >
        <GlassView intensity={10} style={[
            styles.contactCard,
            isSelected && { borderColor: VextroTheme.primary, backgroundColor: 'rgba(191,0,255,0.05)' }
          ]}
        >
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
          
          {/* Checkbox */}
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Check size={12} color={VextroTheme.background} />}
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => mode === 'SET_GROUP_NAME' ? setMode('SELECT_MEMBERS') : navigation.goBack()} 
        style={styles.backBtn}
      >
        <ArrowLeft color={VextroTheme.text} size={24} />
      </TouchableOpacity>
      <View style={styles.headerTexts}>
        <ScaledText style={styles.headerTitle}>NOWA GRUPA</ScaledText>
        <ScaledText style={styles.headerSubtitle}>
          {mode === 'SELECT_MEMBERS' ? (
            selectedContacts.size > 0 ? `WYBRANO: ${selectedContacts.size}` : 'WYBIERZ WĘZŁY'
          ) : (
            'KONFIGURACJA PROTOKOŁU'
          )}
        </ScaledText>
      </View>
    </View>
  );

  return (
    <CyberBackground>
      <SafeAreaView style={styles.container}>
        <Header />

        {mode === 'SELECT_MEMBERS' ? (
          <View style={styles.flex}>
            <View style={styles.searchSection}>
              <GlassView intensity={15} style={styles.searchBar}>
                <Search size={18} color={VextroTheme.textMuted} style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="SZUKAJ WĘZŁÓW..."
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

            {selectedContacts.size > 0 && (
              <TouchableOpacity
                style={styles.fabBtn}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[VextroTheme.primary, VextroTheme.secondary]}
                  style={styles.fabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <ArrowLeft size={24} color={VextroTheme.background} style={{ transform: [{ rotate: '180deg' }] }} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
            <View style={styles.nameSetupContainer}>
              <View style={styles.groupIconPlaceholder}>
                <Users size={48} color={VextroTheme.primary} />
                <View style={styles.shieldBadge}>
                  <ShieldCheck size={16} color={VextroTheme.background} />
                </View>
              </View>

              <Text style={styles.inputLabel}>NAZWA GRUPY SIECIOWEJ</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="np. KRYPTOGRAFIA I"
                  placeholderTextColor={VextroTheme.textMuted}
                  style={styles.nameInput}
                  selectionColor={VextroTheme.primary}
                  autoFocus
                  maxLength={40}
                  autoCapitalize="characters"
                />
              </View>
              <Text style={styles.hintText}>Grupa będzie szyfrowana przy użyciu zaawansowanego protokołu wymiany kluczy (E2E Multi-party).</Text>

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                onPress={handleCreateGroup}
                style={styles.addBtn}
                disabled={!groupName.trim() || isCreating}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={groupName.trim() ? [VextroTheme.primary, VextroTheme.secondary] : ['#333', '#333']}
                  style={styles.addBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isCreating ? (
                    <ActivityIndicator color={VextroTheme.background} size="small" />
                  ) : (
                    <Text style={[styles.addBtnText, !groupName.trim() && { color: '#666' }]}>
                      INICJUJ GRUPĘ
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
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
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  contactWrapper: { marginBottom: 12 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: VextroTheme.primary,
    borderColor: VextroTheme.primary,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: VextroTheme.primary,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSetupContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  groupIconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(191,0,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(191,0,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    position: 'relative',
  },
  shieldBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: VextroTheme.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: VextroTheme.background,
  },
  inputLabel: {
    color: VextroTheme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  inputRow: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(191,0,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 20,
    height: 64,
    width: '100%',
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    color: VextroTheme.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hintText: {
    color: VextroTheme.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.6,
  },
  addBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  addBtnGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: VextroTheme.background,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
});
