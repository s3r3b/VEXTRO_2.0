// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/InterfaceSynthesisScreen.js
import React from 'react';
import { 
  StyleSheet, View, Text, SafeAreaView, ScrollView, 
  TouchableOpacity, StatusBar, Switch 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { 
  Type, MessageSquare, 
  ShieldAlert, ChevronLeft, Zap, Palette
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useUI } from '../context/UIContext';
import { VextroTheme } from '../theme/colors';
import { WALLPAPERS } from '../theme/wallpapers';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import ScaledText from '../components/ScaledText';

/**
 * VEXTRO 4.5 INTERFACE SYNTHESIS
 * Centrum personalizacji estetyki i fizyki terminala.
 */
export default function InterfaceSynthesisScreen({ navigation }) {
  const { 
    fontSizeFactor, setFontSizeFactor, 
    wallpaper, setWallpaper, 
    enterSends, setEnterSends, 
    themeMode, setThemeMode,
    activeTheme,
  } = useUI();

  const handleFontSizeChange = (value) => {
    setFontSizeFactor(value);
    // Delikatny haptic przy zmianie rozmiaru
    if (Math.round(value * 10) % 2 === 0) {
       Haptics.selectionAsync();
    }
  };

  // ─── THEME PREVIEW CARD ─────────────────────────────────────────────────────
  const ThemeCard = ({ theme }) => {
    const isActive = wallpaper === theme.id;
    return (
      <TouchableOpacity
        style={[styles.themeCard, isActive && { borderColor: theme.primary, borderWidth: 2 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setWallpaper(theme.id);
        }}
        activeOpacity={0.8}
      >
        {/* Miniaturka — realne gradienty motywu */}
        <View style={[styles.thumbContainer, { backgroundColor: theme.background }]}>
          {/* Aura top */}
          <View style={[styles.thumbAuraTop, { backgroundColor: theme.primary + '30' }]} />
          {/* Aura bottom */}
          <View style={[styles.thumbAuraBottom, { backgroundColor: theme.accent + '20' }]} />
          {/* Fake UI elements */}
          <View style={styles.thumbContent}>
            {/* Header bar */}
            <View style={[styles.thumbHeader, { borderBottomColor: theme.primary + '40' }]}>
              <View style={[styles.thumbDot, { backgroundColor: theme.primary }]} />
              <View style={[styles.thumbLine, { backgroundColor: theme.primary + '60', width: 40 }]} />
            </View>
            {/* Message bubbles */}
            <View style={styles.thumbMessages}>
              <View style={[styles.thumbBubbleOther, { 
                backgroundColor: theme.primary + '18', 
                borderColor: theme.surfaceBorder 
              }]}>
                <View style={[styles.thumbTextLine, { backgroundColor: theme.accent + '60', width: 30 }]} />
              </View>
              <View style={[styles.thumbBubbleMine, { backgroundColor: theme.primary }]}>
                <View style={[styles.thumbTextLine, { backgroundColor: 'rgba(255,255,255,0.6)', width: 24 }]} />
              </View>
              <View style={[styles.thumbBubbleOther, { 
                backgroundColor: theme.primary + '18', 
                borderColor: theme.surfaceBorder 
              }]}>
                <View style={[styles.thumbTextLine, { backgroundColor: theme.accent + '60', width: 36 }]} />
              </View>
            </View>
            {/* Input bar */}
            <View style={[styles.thumbInput, { 
              backgroundColor: theme.primary + '15', 
              borderColor: theme.primary + '30' 
            }]}>
              <View style={[styles.thumbSendBtn, { backgroundColor: theme.primary }]} />
            </View>
          </View>
          {/* Active checkmark */}
          {isActive && (
            <View style={[styles.thumbCheck, { backgroundColor: theme.primary }]}>
              <Text style={styles.thumbCheckText}>✓</Text>
            </View>
          )}
        </View>

        {/* Color swatches */}
        <View style={styles.swatchRow}>
          <View style={[styles.swatch, { backgroundColor: theme.primary }]} />
          <View style={[styles.swatch, { backgroundColor: theme.secondary }]} />
          <View style={[styles.swatch, { backgroundColor: theme.accent }]} />
          <View style={[styles.swatch, { backgroundColor: theme.background, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]} />
        </View>

        {/* Labels */}
        <Text style={[styles.themeLabel, isActive && { color: theme.primary }]}>
          {theme.label}
        </Text>
        <Text style={styles.themeDesc}>{theme.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <CyberBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={VextroTheme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>INTERFACE SYNTHESIS</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* PREVIEW CARD */}
          <GlassView style={styles.previewCard}>
            <Zap size={16} color={VextroTheme.primary} style={{ marginBottom: 8 }} />
            <ScaledText style={styles.previewLabel}>REAL-TIME PREVIEW</ScaledText>
            <ScaledText style={styles.previewText}>
              System typografii VEXTRO reaguje natychmiast na zmiany gęstości informacji.
            </ScaledText>
          </GlassView>

          {/* TYPOGRAPHY SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Type size={14} color={VextroTheme.accent} />
              <Text style={styles.sectionHeader}>TYPOGRAPHY SCALING</Text>
            </View>
            <GlassView intensity={10} style={styles.controlCard}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>FONT SIZE FACTOR</Text>
                <Text style={styles.sliderValue}>{Math.round(fontSizeFactor * 100)}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0.8}
                maximumValue={1.5}
                step={0.05}
                value={fontSizeFactor}
                onValueChange={handleFontSizeChange}
                minimumTrackTintColor={VextroTheme.primary}
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor={VextroTheme.primary}
              />
              <View style={styles.sliderFooter}>
                <Text style={styles.footerText}>COMPACT</Text>
                <Text style={styles.footerText}>MAXIMUM</Text>
              </View>
            </GlassView>
          </View>

          {/* WALLPAPER SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Palette size={14} color={VextroTheme.accent} />
              <Text style={styles.sectionHeader}>AESTHETIC ENVIRONMENT</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeScroll}>
              {Object.values(WALLPAPERS).map(theme => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </ScrollView>
          </View>

          {/* CHAT PREFERENCES */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <MessageSquare size={14} color={VextroTheme.accent} />
              <Text style={styles.sectionHeader}>CHAT PROTOCOLS</Text>
            </View>
            <GlassView intensity={10} style={styles.groupCard}>
              <View style={styles.toggleRow}>
                <View>
                   <Text style={styles.toggleLabel}>Enter sends message</Text>
                   <Text style={styles.toggleSub}>Immediate transmission on return key</Text>
                </View>
                <Switch 
                  value={enterSends} 
                  onValueChange={setEnterSends}
                  trackColor={{ false: '#1a1a1a', true: VextroTheme.primary + '66' }}
                  thumbColor={enterSends ? VextroTheme.primary : '#444'}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <View>
                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.toggleLabel}>Anti-Voice Protection</Text>
                      <ShieldAlert size={10} color={VextroTheme.error} style={{ marginLeft: 6 }} />
                   </View>
                   <Text style={styles.toggleSub}>Hardware-level audio obfuscation</Text>
                </View>
                <Switch 
                  value={false} 
                  disabled={true} // Funkcja w planie Shield
                  trackColor={{ false: '#000', true: VextroTheme.primary + '66' }}
                />
              </View>
            </GlassView>
          </View>

        </ScrollView>
      </SafeAreaView>
    </CyberBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerTitle: { color: VextroTheme.text, fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  backBtn: { padding: 10 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  previewCard: { padding: 20, marginBottom: 24, borderRadius: 24 },
  previewLabel: { color: VextroTheme.primary, fontWeight: '900', fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  previewText: { color: VextroTheme.text, fontWeight: '500', opacity: 0.8 },
  section: { marginBottom: 32 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 },
  sectionHeader: { color: VextroTheme.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginLeft: 8 },
  controlCard: { padding: 20, borderRadius: 24 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sliderLabel: { color: VextroTheme.text, fontSize: 10, fontWeight: '700', opacity: 0.6 },
  sliderValue: { color: VextroTheme.primary, fontSize: 12, fontWeight: '900' },
  slider: { width: '100%', height: 40 },
  sliderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  footerText: { color: VextroTheme.textMuted, fontSize: 8, fontWeight: '800', opacity: 0.5 },
  // ─── THEME CARDS ───────────────────────────────────────────────────────────
  themeScroll: { paddingLeft: 4, paddingRight: 4, paddingBottom: 8 },
  themeCard: {
    width: 120,
    marginRight: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
    paddingBottom: 12,
  },
  thumbContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  thumbAuraTop: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 140,
    height: 80,
    borderRadius: 70,
  },
  thumbAuraBottom: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 100,
    height: 60,
    borderRadius: 50,
  },
  thumbContent: {
    position: 'absolute',
    inset: 0,
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  thumbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    gap: 4,
  },
  thumbDot: { width: 6, height: 6, borderRadius: 3 },
  thumbLine: { height: 3, borderRadius: 2 },
  thumbMessages: {
    flex: 1,
    paddingVertical: 8,
    gap: 5,
    justifyContent: 'center',
  },
  thumbBubbleOther: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  thumbBubbleMine: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  thumbTextLine: { height: 3, borderRadius: 2 },
  thumbInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 6,
  },
  thumbSendBtn: { width: 14, height: 14, borderRadius: 7 },
  thumbCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbCheckText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  swatch: { width: 16, height: 16, borderRadius: 8 },
  themeLabel: { color: VextroTheme.text, fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 8, paddingHorizontal: 8 },
  themeDesc: { color: VextroTheme.textMuted, fontSize: 8, textAlign: 'center', marginTop: 2, paddingHorizontal: 8, opacity: 0.6 },
  // ─── REST ──────────────────────────────────────────────────────────────────
  groupCard: { paddingHorizontal: 20, borderRadius: 24 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  toggleLabel: { color: VextroTheme.text, fontSize: 13, fontWeight: '700' },
  toggleSub: { color: VextroTheme.textMuted, fontSize: 9, marginTop: 4, opacity: 0.6 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }
});
