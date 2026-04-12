// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/ContactsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  SafeAreaView, TextInput, StatusBar, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { 
  VxRadarIcon, 
  VxProfileIcon, 
  VxSecurityIcon, 
  VxNeuralIcon, 
  VxInterfaceIcon, 
  VxBackIcon, 
  VxShortcutIcon 
} from '../components/ui/icons/static';
import { VxGearIcon } from '../components/ui/icons/kinetic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS 
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import ScaledText from '../components/ScaledText';
import ContactsService from '../services/ContactsService';
import GroupService from '../services/GroupService';

export default function ContactsScreen({ navigation }) {
  const [myPhone, setMyPhone] = useState('');
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ─── AI CONFIG STATE ───────────────────────────────────────────────────────
  const [aiConfig, setAiConfig] = useState({ enabled: false, nick: 'YOUR API CHATBOT AI' });

  const loadAiConfig = async () => {
    const enabled = await AsyncStorage.getItem('ai_enabled');
    const nick = await AsyncStorage.getItem('ai_nick');
    setAiConfig({
      enabled: enabled === 'true',
      nick: nick || 'YOUR API CHATBOT AI'
    });
  };

  // ─── LOGIKA ANIMOWANEGO SZUKANIA ──────────────────────────────────────────
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = React.useRef(null);
  
  const searchWidth = useSharedValue(44); // Mały kwadrat (ikona)
  const searchHeight = useSharedValue(44);

  const toggleSearch = () => {
    if (!isSearchExpanded) {
      // 1. ROZWINIĘCIE: Dół (Y) -> Prawo (X)
      searchHeight.value = withTiming(52, { duration: 200 }, () => {
        searchWidth.value = withTiming(SCREEN_WIDTH - 48, { duration: 400 }, () => {
          runOnJS(setIsSearchExpanded)(true);
        });
      });
    } else {
      // 2. ZWINIĘCIE: Lewo -> Góra
      searchWidth.value = withTiming(44, { duration: 300 }, () => {
        searchHeight.value = withTiming(44, { duration: 200 }, () => {
          runOnJS(setIsSearchExpanded)(false);
          runOnJS(setSearchQuery)('');
        });
      });
    }
  };

  const animatedSearchStyle = useAnimatedStyle(() => ({
    width: searchWidth.value,
    height: searchHeight.value,
    borderRadius: isSearchExpanded ? 16 : 22,
    borderWidth: 1,
    borderColor: isSearchExpanded ? 'rgba(191, 0, 255, 0.4)' : 'rgba(255,255,255,0.1)',
    shadowColor: VextroTheme.primary,
    shadowOpacity: isSearchExpanded ? 0.3 : 0,
    shadowRadius: 10,
  }));

  // Auto-focus po rozwinięciu
  useEffect(() => {
    if (isSearchExpanded) {
      searchInputRef.current?.focus();
    }
  }, [isSearchExpanded]);

  // ─── ŁADOWANIE SIECI (Kontakty + Grupy) ──────────────────────────────────────
  const loadData = useCallback(async (phone) => {
    setIsLoading(true);
    await loadAiConfig(); // Załaduj też config AI
    const [freshContacts, freshGroups] = await Promise.all([
      ContactsService.getContacts(phone),
      GroupService.getGroups(phone)
    ]);
    setContacts(freshContacts);
    setGroups(freshGroups);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      if (phone) {
        setMyPhone(phone);
        await loadData(phone);
      } else {
        setIsLoading(false);
      }
    };
    init();

    // Odśwież po powrocie na ekran (np. po zakończeniu chatu)
    const unsubscribe = navigation.addListener('focus', () => {
      if (myPhone) loadData(myPhone);
      else loadAiConfig();
    });
    return unsubscribe;
  }, [navigation, myPhone, loadData]);

  // ─── FILTROWANIE ────────────────────────────────────────────────────────────
  const combinedNodes = [];
  
  if (aiConfig.enabled) {
    combinedNodes.push({
      _id: 'vextro-ai',
      contactPhone: 'AI',
      displayName: aiConfig.nick,
      isAI: true,
      online: true,
      lastMessage: { content: 'Neural engine gotowy.', timestamp: null },
    });
  }

  combinedNodes.push(
    ...groups.map(g => ({ ...g, isGroup: true, displayName: g.groupName })),
    ...contacts
  );

  const filteredContacts = combinedNodes.filter(c =>
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPhone?.includes(searchQuery)
  );

  // ─── RENDER WĘZŁA ───────────────────────────────────────────────────────────
  const renderContact = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.isGroup) {
          navigation.navigate('GroupChat', {
            groupId: item._id,
            groupName: item.groupName,
            groupMembers: item.members,
            adminPhone: item.adminPhone,
            isBlocked: item.isBlocked,
            isMuted: item.isMuted
          });
        } else {
          navigation.navigate('Chat', {
            title: item.displayName || item.contactPhone,
            phoneNumber: item.contactPhone,
            remotePublicKey: item.publicKey || null,
            isBlocked: item.isBlocked,
            isMuted: item.isMuted
          });
        }
      }}
      activeOpacity={0.7}
      style={styles.contactWrapper}
    >
      <GlassView intensity={10} style={styles.contactCard}>
        <View style={styles.avatarWrapper}>
          {item.isAI ? (
            <VxNeuralIcon size={30} />
          ) : (
            item.isGroup ? <VxSecurityIcon size={30} /> : <VxProfileIcon size={30} />
          )}
          {item.isAI && <View style={styles.onlinePulse} />}
        </View>

        {/* Info */}
        <View style={styles.contactInfo}>
          <View style={styles.nameRow}>
            <ScaledText style={styles.contactName} numberOfLines={1}>
              {item.displayName || item.contactPhone}
            </ScaledText>
            {item.isAI && (
              <ScaledText style={styles.onlineStatus}>ONLINE</ScaledText>
            )}
            {item.isGroup && (
              <ScaledText style={[styles.onlineStatus, { color: '#00f0ff' }]}>GROUP</ScaledText>
            )}
          </View>
          <ScaledText style={styles.lastMsg} numberOfLines={1}>
            {item.lastMessage?.content || (item.isGroup ? `${item.members.length} CZŁONKÓW` : item.contactPhone)}
          </ScaledText>
        </View>

        <VxBackIcon size={18} color={VextroTheme.surfaceBorder} style={{ transform: [{ rotate: '180deg' }] }} />
      </GlassView>
    </TouchableOpacity>
  );

  // ─── EMPTY STATE ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <VxRadarIcon size={48} color={VextroTheme.primary} />
      <ScaledText style={styles.emptyTitle}>SIEĆ PUSTA</ScaledText>
      <ScaledText style={styles.emptySubtitle}>
        Dodaj pierwszy kontakt klikając przycisk +
      </ScaledText>
    </View>
  );

  return (
    <CyberBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <ScaledText style={styles.headerSubtitle}>ENCRYPTED NETWORK</ScaledText>
            <ScaledText style={styles.headerTitle}>TERMINAL</ScaledText>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {myPhone === '+48798884532' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Terminal')}
                style={styles.adminBtn}
              >
                <VxNeuralIcon size={24} color={VextroTheme.accent} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.settingsBtn}
            >
                <VxGearIcon size={24} color={VextroTheme.primary} spinning={false} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Segment - Animowany */}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={!isSearchExpanded ? toggleSearch : null}
            style={styles.searchTouchable}
          >
            <Animated.View style={[styles.animatedSearchWrapper, animatedSearchStyle]}>
              <GlassView intensity={20} style={styles.searchInner}>
                <TouchableOpacity onPress={toggleSearch} style={styles.searchIconBtn}>
                  <VxRadarIcon size={22} color={isSearchExpanded ? VextroTheme.primary : VextroTheme.textMuted} />
                </TouchableOpacity>

                {isSearchExpanded && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      ref={searchInputRef}
                      placeholder="FILTRUJ WĘZŁY..."
                      placeholderTextColor={VextroTheme.textMuted}
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      selectionColor={VextroTheme.primary}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                        <VxBackIcon size={18} color={VextroTheme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </GlassView>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Protocol Banner */}
        <View style={styles.protocolBanner}>
          <LinearGradient
            colors={['transparent', 'rgba(191, 0, 255, 0.05)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <VxRadarIcon size={12} color={VextroTheme.primary} />
          <Text style={styles.protocolText}>
            VEXTRO v3.0.0-PROD // {contacts.length} SECURE NODE{contacts.length !== 1 ? 'S' : ''} ACTIVE
          </Text>
        </View>

        {/* Contact List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={VextroTheme.primary} size="large" />
            <ScaledText style={styles.loadingText}>SYNCHRONIZING NETWORK...</ScaledText>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={item => item._id || item.contactPhone}
            renderItem={renderContact}
            contentContainerStyle={[
              styles.listContainer,
              filteredContacts.length <= 1 && styles.listContainerFlex,
            ]}
            ListEmptyComponent={<EmptyState />}
          />
        )}

        {/* FAB — Nowa Wiadomość */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SelectContact')}
        >
          <LinearGradient
            colors={[VextroTheme.primary, VextroTheme.secondary]}
            style={styles.fabGradient}
          >
            <VxShortcutIcon size={24} color={VextroTheme.background} />
          </LinearGradient>
        </TouchableOpacity>

      </SafeAreaView>
    </CyberBackground>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    color: VextroTheme.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.6,
  },
  headerTitle: {
    color: VextroTheme.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: VextroTheme.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 10, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: VextroTheme.surfaceBorder,
  },
  adminBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: VextroTheme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'flex-start', // Ważne: zaczynamy od lewej
    height: 52,
    zIndex: 10,
  },
  searchTouchable: {
    flex: 1,
  },
  animatedSearchWrapper: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  searchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0, 
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  searchInput: {
    flex: 1,
    color: VextroTheme.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    height: '100%',
  },
  protocolBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  protocolText: {
    color: VextroTheme.primary,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: VextroTheme.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  listContainerFlex: { flex: 1 },
  contactWrapper: { marginBottom: 16 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderColor: 'rgba(191, 0, 255, 0.1)',
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.2)',
    position: 'relative',
  },
  avatarText: { fontSize: 24 },
  onlinePulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: VextroTheme.accent,
    borderWidth: 3,
    borderColor: VextroTheme.background,
  },
  contactInfo: { flex: 1, marginLeft: 16 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    color: VextroTheme.text,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
    flex: 1,
  },
  onlineStatus: { color: VextroTheme.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  lastMsg: { color: VextroTheme.textMuted, fontSize: 12, opacity: 0.8 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    color: VextroTheme.textMuted,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: VextroTheme.textMuted,
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
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
});