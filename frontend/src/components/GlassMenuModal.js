import React, { useState } from 'react';
import { 
  Modal, StyleSheet, View, TouchableOpacity, Text, 
  TouchableWithoutFeedback, Animated 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { VextroTheme } from '../theme/colors';
import { 
  UserSquare2, Search, Link2, BellOff, Ghost, 
  Settings2, Ban, Trash2, ArrowLeft, PlusSquare 
} from 'lucide-react-native';
import ScaledText from './ScaledText';

export default function GlassMenuModal({ visible, onClose, onAction, isMuted, isBlocked, isGhost }) {
  const [menuView, setMenuView] = useState('MAIN'); // 'MAIN' | 'MORE'

  const mainOptions = [
    { id: '1', label: 'Wyświetl kontakt', icon: UserSquare2, danger: false, actionKey: 'VIEW_CONTACT' },
    { id: '2', label: 'Szukaj', icon: Search, danger: false, actionKey: 'SEARCH' },
    { id: '3', label: 'Multimedia, linki i dok...', icon: Link2, danger: false, actionKey: 'MEDIA' },
    { id: '4', label: isMuted ? 'Odwisz powiadomienia' : 'Wycisz powiadomienia', icon: BellOff, danger: false, actionKey: 'TOGGLE_MUTE' },
    { id: '5', label: isGhost ? 'OFF GHOST MODE' : 'GHOST MODE', icon: Ghost, danger: false, highlight: true, actionKey: 'TOGGLE_GHOST' },
    { id: '6', label: 'Więcej', icon: Settings2, danger: false, action: () => setMenuView('MORE') },
  ];

  const moreOptions = [
    { id: '7', label: 'Wróć', icon: ArrowLeft, danger: false, action: () => setMenuView('MAIN') },
    { id: '8', label: isBlocked ? 'Odblokuj' : 'Zablokuj', icon: Ban, danger: true, actionKey: 'TOGGLE_BLOCK' },
    { id: '9', label: 'Wyczyść czat', icon: Trash2, danger: true, actionKey: 'CLEAR_CHAT' },
    { id: '10', label: 'Dodaj skrót', icon: PlusSquare, danger: false, actionKey: 'ADD_SHORTCUT' },
  ];

  const currentOptions = menuView === 'MAIN' ? mainOptions : moreOptions;

  const handlePress = (opt) => {
    if (opt.action) {
      opt.action();
    } else if (opt.actionKey) {
      onAction && onAction(opt.actionKey);
      closeModal();
    }
  };

  const closeModal = () => {
    setMenuView('MAIN');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <BlurView intensity={40} tint="dark" style={styles.glassBackground}>
                {currentOptions.map((opt) => {
                  const IconComponent = opt.icon;
                  const color = opt.danger 
                    ? '#ff4444' 
                    : opt.highlight 
                      ? VextroTheme.primary 
                      : VextroTheme.text;
                      
                  return (
                    <TouchableOpacity 
                      key={opt.id} 
                      style={styles.optionRow}
                      onPress={() => handlePress(opt)}
                      activeOpacity={0.7}
                    >
                      <ScaledText style={[styles.optionText, { color }]}>
                        {opt.label}
                      </ScaledText>
                      {IconComponent && (
                        <IconComponent 
                          size={18} 
                          color={color} 
                          strokeWidth={opt.highlight ? 2.5 : 2}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
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
    backgroundColor: 'rgba(0,0,0,0.15)', // Delikatne przyciemnienie
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 240,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  glassBackground: {
    paddingVertical: 8,
    backgroundColor: 'rgba(20,20,30,0.85)',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
  }
});
