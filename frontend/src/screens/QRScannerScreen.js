// Ścieżka: /workspaces/VEXTRO/frontend/src/screens/QRScannerScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Zap, X, ShieldAlert, Cpu, ScanLine } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { VextroTheme } from '../theme/colors';
import CyberBackground from '../components/CyberBackground';
import GlassView from '../components/GlassView';
import NetworkConfig from '../services/NetworkConfig';

const { width, height } = Dimensions.get('window');

/**
 * VEXTRO 3.0 SCANNER HUD
 * Wysokiej klasy interfejs skanera kodów QR do synchronizacji Premium Sync.
 * Zaprojektowany jako systemowy "Digital Eye".
 */
export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    
    // Haptyka premium - sukces namierzenia celu
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Format: vextro://auth?token=...&server=...
      if (data.startsWith('vextro://auth')) {
        const urlParams = new URLSearchParams(data.split('?')[1]);
        const serverUrl = urlParams.get('server');
        const token = urlParams.get('token');

        if (serverUrl) {
            NetworkConfig.setDynamicUrl(serverUrl);
            // Wygenerowano handshake – powrót do logowania z nowym adresem
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack(); 
         }
      } else {
        throw new Error("INVALID_NODE_ADDRESS");
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("LINK ERROR", "UNABLE TO IDENTIFY COMPATIBLE VEXTRO NODE.");
      setScanned(false);
    }
  };

  if (!permission) return <CyberBackground><View /></CyberBackground>;
  if (!permission.granted) {
    return (
      <CyberBackground>
        <View style={styles.center}>
          <ShieldAlert size={64} color={VextroTheme.error} />
          <Text style={styles.permText}>CAMERA ACCESS REQUIRED FOR ENCRYPTION SYNC</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
            <Text style={styles.permBtnText}>AUTHORIZE ACCESS</Text>
          </TouchableOpacity>
        </View>
      </CyberBackground>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView 
        style={StyleSheet.absoluteFill} 
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={flash}
        barcodeScannerSettings={{
           barcodeTypes: ["qr"],
        }}
      />

      {/* Scoping HUD Overlay */}
      <View style={styles.overlay}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                <X color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.statusBox}>
                <Cpu size={12} color={VextroTheme.accent} />
                <Text style={styles.statusText}>HUB DISCOVERY MODE</Text>
            </View>
            <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.closeBtn}>
                <Zap color={flash ? VextroTheme.accent : "#fff"} size={24} />
            </TouchableOpacity>
        </View>

        <View style={styles.scannerArea}>
            <View style={styles.targetCornerTL} />
            <View style={styles.targetCornerTR} />
            <View style={styles.targetCornerBL} />
            <View style={styles.targetCornerBR} />
            
            <View style={styles.scannerLine} />
            <View style={styles.targetCenter}>
                <ScanLine size={32} color="rgba(0, 240, 255, 0.3)" />
            </View>
        </View>

        <View style={styles.footer}>
            <GlassView intensity={40} style={styles.infoBox}>
                <Text style={styles.infoText}>
                    POINT DIGITAL EYE AT THE QR CODE ON YOUR DESKTOP TERMINAL
                </Text>
                <View style={styles.latencyRow}>
                    <Text style={styles.latencyText}>PROTOCOL: V-SYNC 3.0</Text>
                    <Text style={styles.latencyText}>LATENCY: <Text style={{color: VextroTheme.success}}>OPTIMAL</Text></Text>
                </View>
            </GlassView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, padding: 24, justifyContent: 'space-between' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 40 
  },
  closeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  statusText: {
    color: VextroTheme.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  scannerArea: {
    width: width * 0.7,
    height: width * 0.7,
    alignSelf: 'center',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetCornerTL: { position: 'absolute', top: -10, left: -10, width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3, borderColor: VextroTheme.accent, borderTopLeftRadius: 10 },
  targetCornerTR: { position: 'absolute', top: -10, right: -10, width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3, borderColor: VextroTheme.accent, borderTopRightRadius: 10 },
  targetCornerBL: { position: 'absolute', bottom: -10, left: -10, width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: VextroTheme.accent, borderBottomLeftRadius: 10 },
  targetCornerBR: { position: 'absolute', bottom: -10, right: -10, width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3, borderColor: VextroTheme.accent, borderBottomRightRadius: 10 },
  
  scannerLine: {
    width: '100%',
    height: 2,
    backgroundColor: VextroTheme.accent,
    shadowColor: VextroTheme.accent,
    shadowRadius: 10,
    shadowOpacity: 0.8,
    opacity: 0.5,
    position: 'absolute',
    top: '50%',
  },
  footer: { marginBottom: 40 },
  infoBox: { padding: 24, borderRadius: 20 },
  infoText: { 
    color: '#fff', 
    fontSize: 11, 
    textAlign: 'center', 
    lineHeight: 18, 
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.8
  },
  latencyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  latencyText: {
    color: VextroTheme.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permText: { 
    color: VextroTheme.error, 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 12, 
    fontWeight: '800', 
    letterSpacing: 1.5 
  },
  permBtn: {
    marginTop: 32,
    backgroundColor: VextroTheme.error,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permBtnText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 1 }
});
