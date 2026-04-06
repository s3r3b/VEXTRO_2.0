import React from 'react';
import { 
  Modal, StyleSheet, View, TouchableOpacity, Text, 
  TouchableWithoutFeedback, ScrollView, Dimensions 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { VextroTheme } from '../theme/colors';
import { 
  ShieldCheck, User, Users, BellOff, Ban, 
  Trash2, X, Fingerprint, Info 
} from 'lucide-react-native';
import ScaledText from './ScaledText';

const { height } = Dimensions.get('window');

export default function HologramProfileModal({ visible, onClose, data, onAction, isMuted, isBlocked }) {
  if (!data) return null;

  const { title, phoneNumber, remotePublicKey, isGroup } = data;

  // Formatowanie Fingerprintu E2EE (Public Key)
  const formatFingerprint = (key) => {
    if (!key) return "WĘZEŁ NIEZWERYFIKOWANY";
    // Bierzemy fragmenty klucza i dzielimy na bloki 4-znakowe
    const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const blocks = [];
    for (let i = 0; i < cleanKey.length && blocks.length < 8; i += 4) {
      blocks.push(cleanKey.substring(i, i + 4));
    }
    return blocks.join(' - ');
  };

  const fingerprint = formatFingerprint(remotePublicKey);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <BlurView intensity={80} tint="dark" style={styles.glass}>
                {/* Drag Handle */}
                <View style={styles.handle} />
                
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <X color={VextroTheme.textMuted} size={24} />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                  {/* Header: Avatar & Name */}
                  <View style={styles.header}>
                    <View style={styles.avatarGlow}>
                      <View style={styles.avatar}>
                        {isGroup ? (
                          <Users size={40} color={VextroTheme.primary} />
                        ) : (
                          <User size={40} color={VextroTheme.primary} />
                        )}
                      </View>
                    </View>
                    <ScaledText style={styles.title}>{title}</ScaledText>
                    <ScaledText style={styles.subtitle}>
                      {isGroup ? "ACTIVE PROTECTED GROUP" : (phoneNumber === 'AI' ? "NEURAL NETWORK" : phoneNumber)}
                    </ScaledText>
                    
                    <View style={styles.badge}>
                      <ShieldCheck size={12} color={VextroTheme.accent} />
                      <Text style={styles.badgeText}>ZABEZPIECZONO PROTOKOŁEM SHIELD [E2EE]</Text>
                    </View>
                  </View>

                  {/* Trust Verification Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Fingerprint size={16} color={VextroTheme.primary} />
                      <Text style={styles.sectionTitle}>WERYFIKACJA TOŻSAMOŚCI</Text>
                    </View>
                    <View style={styles.fingerprintBox}>
                      <Text style={styles.fingerprintText}>{fingerprint}</Text>
                      <Text style={styles.fingerprintDesc}>
                        Porównaj te segmenty kodu z rozmówcą. Jeśli są identyczne, masz pewność, że kanał nie jest podsłuchiwany.
                      </Text>
                    </View>
                  </View>

                  {/* Quick Actions */}
                  <View style={styles.actionsGrid}>
                    <TouchableOpacity 
                      style={styles.actionCard} 
                      onPress={() => onAction('TOGGLE_MUTE')}
                    >
                      <BellOff size={20} color={isMuted ? VextroTheme.primary : VextroTheme.text} />
                      <Text style={[styles.actionLabel, isMuted && {color: VextroTheme.primary}]}>
                        {isMuted ? 'ODWISZ' : 'WYCISZ'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionCard} 
                      onPress={() => onAction('TOGGLE_BLOCK')}
                    >
                      <Ban size={20} color={isBlocked ? "#ff4444" : VextroTheme.text} />
                      <Text style={[styles.actionLabel, isBlocked && {color: "#ff4444"}]}>
                        {isBlocked ? 'ODBLOKUJ' : 'ZABLOKUJ'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionCard} 
                      onPress={() => onAction('CLEAR_CHAT')}
                    >
                      <Trash2 size={20} color="#ff4444" />
                      <Text style={[styles.actionLabel, {color: "#ff4444"}]}>CZYŚĆ</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoFooter}>
                     <Info size={14} color={VextroTheme.textMuted} />
                     <Text style={styles.infoText}>VEXTRO 4.5 Pulse & Shield Engine</Text>
                  </View>
                </ScrollView>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.75,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  glass: {
    flex: 1,
    backgroundColor: 'rgba(15,15,25,0.92)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(191, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.3)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: VextroTheme.textMuted,
    fontFamily: 'System',
    letterSpacing: 1,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  badgeText: {
    fontSize: 8,
    color: VextroTheme.accent,
    fontWeight: 'bold',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    color: VextroTheme.primary,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1.5,
  },
  fingerprintBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  fingerprintText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fingerprintDesc: {
    fontSize: 10,
    color: VextroTheme.textMuted,
    lineHeight: 14,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: VextroTheme.text,
    marginTop: 8,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  infoText: {
    fontSize: 9,
    color: VextroTheme.textMuted,
    marginLeft: 6,
    letterSpacing: 1,
  }
});
