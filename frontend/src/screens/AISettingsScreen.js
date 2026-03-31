import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TextInput, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AISettingsScreen({ navigation }) {
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [nickname, setNickname] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      const storedEnabled = await AsyncStorage.getItem('ai_enabled');
      const storedKey = await AsyncStorage.getItem('ai_api_key');
      const storedNick = await AsyncStorage.getItem('ai_nickname');
      if (storedEnabled !== null) {
        const isEnabled = storedEnabled === 'true';
        setEnabled(isEnabled);
        setShowDetails(isEnabled);
      }
      if (storedKey) setApiKey(storedKey);
      if (storedNick) setNickname(storedNick);
    };
    loadSettings();
  }, []);

  const toggleSwitch = async (value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEnabled(value);
    setShowDetails(value);
    await AsyncStorage.setItem('ai_enabled', value.toString());
    // Dane (API key, nickname) są zachowane — tylko widoczność w kontaktach się zmienia
  };

  const saveApiKey = async (key) => {
    setApiKey(key);
    await AsyncStorage.setItem('ai_api_key', key);
  };

  const saveNickname = async (nick) => {
    setNickname(nick);
    await AsyncStorage.setItem('ai_nickname', nick);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>AI Settings</Text>
        <Switch value={enabled} onValueChange={toggleSwitch} />
      </View>
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Private API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your private AI API key"
            value={apiKey}
            onChangeText={saveApiKey}
            placeholderTextColor="#777"
          />
          <Text style={styles.label}>AI Nickname (displayed in contacts)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter nickname"
            value={nickname}
            onChangeText={saveNickname}
            placeholderTextColor="#777"
          />
        </View>
      )}
      <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  detailsContainer: { marginTop: 10 },
  label: { color: '#fff', marginBottom: 5 },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#B026FF',
  },
  closeBtn: {
    marginTop: 30,
    backgroundColor: '#B026FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '600' },
});
