import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import * as Haptics from 'expo-haptics';
import CyberButton from '../components/CyberButton';

export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('[ INICJALIZACJA SKANERA VEXTRO ]');
  const socketRef = useRef(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>VEXTRO wymaga dostępu do matrycy.</Text>
        <CyberButton onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>AUTORYZUJ APARAT</Text>
        </CyberButton>
      </View>
    );
  }

  /**
   * Parsuje QR payload w formacie:
   * vextro://auth?token=<sessionId>&server=<encodedServerUrl>
   */
  const parseQRPayload = (data) => {
    if (!data.startsWith('vextro://auth?')) return null;
    
    const queryString = data.split('?')[1];
    const params = {};
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value || '');
    });
    
    return {
      sessionId: params.token || null,
      serverUrl: params.server || null,
    };
  };

  const handleBarcodeScanned = async ({ type, data }) => {
    // Guard: zapobiegaj wielokrotnym wywołaniom (debounce)
    if (isProcessing || scanned) return;
    
    setIsProcessing(true);
    setScanned(true);
    setStatusText('[ PRZETWARZANIE KODU... ]');

    const payload = parseQRPayload(data);

    if (!payload || !payload.sessionId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('SECURITY ALERT', 'Nieznany lub złośliwy kod.', [
        { text: 'ODRZUĆ', onPress: () => {
            setIsProcessing(false);
            setScanned(false);
            setStatusText('[ INICJALIZACJA SKANERA VEXTRO ]');
        } }
      ]);
      return;
    }

    const { sessionId, serverUrl } = payload;
    const userPhone = await AsyncStorage.getItem('userPhone');

    // Dynamiczny URL: priorytet z QR → fallback na hardcoded
    const socketUrl = serverUrl || 'http://192.168.18.2:5050';
    
    console.log(`📡 [QR] sessionId: ${sessionId}`);
    console.log(`📡 [QR] serverUrl z QR: ${serverUrl}`);
    console.log(`📡 [QR] Łączenie z: ${socketUrl}`);

    setStatusText('[ ŁĄCZENIE Z VEXTRO HUB... ]');

    // Cleanup poprzedniego socketu jeśli istnieje
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'bypass-tunnel-reminder': 'true'
      },
      timeout: 15000,
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`✅ [QR] Połączono z Hub: ${socket.id}`);
      setStatusText('[ AUTORYZACJA W TOKU... ]');

      // Haptic Feedback Premium - Subtelna wibracja przy nawiązaniu linku
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      socket.emit('authorize_web_session', {
          sessionId: sessionId,
          userToken: userPhone || 'MOBILE_AUTH_TOKEN_ACTIVE',
          userData: {
              phone: userPhone,
              device: 'VEXTRO Mobile Node',
              timestamp: new Date().toISOString()
          }
      });
      
      // DEFEKT #3 FIX: Dajemy serwerowi czas na przetworzenie i dostarczenie
      // eventu web_session_authorized do pokoju WebApp, ZANIM się rozłączymy
      setTimeout(() => {
        Alert.alert('LINK ESTABLISHED', 'VEXTRO Premium Sync zainicjowany.', [
          { text: 'OK', onPress: () => {
             socket.disconnect();
             socketRef.current = null;
             setIsProcessing(false);
             navigation.goBack();
          } }
        ]);
      }, 1500);
    });
    
    socket.on('connect_error', (err) => {
       console.log("SOCKET_ERR:", err.message);
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       setStatusText('[ BŁĄD POŁĄCZENIA ]');
       Alert.alert(
         'NET ERROR', 
         `Brak połączenia z VEXTRO Hub.\n\nURL: ${socketUrl}\nBłąd: ${err.message}`, 
         [{ text: 'OK', onPress: () => {
             socket.disconnect();
             socketRef.current = null;
             setIsProcessing(false);
             setScanned(false);
             setStatusText('[ INICJALIZACJA SKANERA VEXTRO ]');
         } }]
       );
    });

    socket.on('auth_error', (data) => {
       console.log("AUTH_ERR:", JSON.stringify(data));
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
       setStatusText('[ SESJA WYGASŁA ]');
       Alert.alert(
         'AUTH ERROR', 
         `Sesja QR wygasła lub została już wykorzystana.\n(${data.error})`,
         [{ text: 'SKANUJ PONOWNIE', onPress: () => {
             socket.disconnect();
             socketRef.current = null;
             setIsProcessing(false);
             setScanned(false);
             setStatusText('[ INICJALIZACJA SKANERA VEXTRO ]');
         } }]
       );
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      
      {/* DEFEKT #2 FIX: pointerEvents="none" — overlay nie blokuje kamery */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.scanFrame} />
        <Text style={styles.scanningText}>{statusText}</Text>
      </View>

      {scanned && (
        <CyberButton onPress={() => { 
          setScanned(false); 
          setIsProcessing(false);
          setStatusText('[ INICJALIZACJA SKANERA VEXTRO ]');
        }} style={styles.rescanBtn}>
          <Text style={styles.btnText}>RESTART SKANERA</Text>
        </CyberButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  message: { color: '#B026FF', textAlign: 'center', marginBottom: 20, fontFamily: 'monospace' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#00f0ff', backgroundColor: 'transparent', shadowColor: '#00f0ff', shadowOpacity: 0.8, shadowRadius: 10 },
  scanningText: { color: '#00f0ff', marginTop: 20, fontFamily: 'monospace', textShadowColor: '#00f0ff', textShadowRadius: 5, fontSize: 11 },
  btn: { padding: 15, borderColor: '#B026FF', borderWidth: 1, borderRadius: 5 },
  btnText: { color: '#B026FF', fontWeight: 'bold' },
  rescanBtn: { position: 'absolute', bottom: 50, padding: 15, borderColor: '#00f0ff', borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.8)' }
});
