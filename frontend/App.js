// Ścieżka: /workspaces/VEXTRO/frontend/App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import AISettingsScreen from './src/screens/AISettingsScreen';
import AccountScreen from './src/screens/AccountScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import CyberButton from './src/components/CyberButton';
const Stack = createStackNavigator();

export default function App() {
  const [isLogged, setIsLogged] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      setIsLogged(!!phone);
    };
    checkAuth();
  }, []);

  if (isLogged === null) return null; // Ekran ładowania

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isLogged ? "Main" : "Login"}
        screenOptions={{
          headerStyle: { 
            backgroundColor: '#121212', 
            borderBottomWidth: 1, 
            borderBottomColor: '#B026FF', 
            shadowColor: '#B026FF', 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.8, 
            shadowRadius: 10, 
            elevation: 10 
          },
          headerTintColor: '#B026FF',
          headerTitleStyle: { fontWeight: '900', letterSpacing: 2, fontSize: 14 },
          cardStyle: { backgroundColor: '#121212' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
        <Stack.Screen 
          name="Main" 
          component={ContactsScreen} 
          options={({ navigation }) => ({ 
            title: 'VEXTRO TERMINAL',
            headerRight: () => (
              <CyberButton style={{ marginRight: 20 }} onPress={() => navigation.navigate('Settings')}>
                <Text style={{ fontSize: 20, textShadowColor: '#B026FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>⚙️</Text>
              </CyberButton>
            )
          })} 
        />

        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={({ route }) => ({ title: route.params?.title || 'ENCRYPTED CHAT' })} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            title: 'SYSTEM CONFIGURATION',
            presentation: 'modal',
            cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS
          }} 
        />
        <Stack.Screen 
          name="ProfileEdit" 
          component={ProfileEditScreen} 
          options={{ title: 'EDIT PROFILE / IDENTITY' }} 
        />
        <Stack.Screen 
          name="AISettings" 
          component={AISettingsScreen} 
          options={{ title: 'AI SETTINGS', presentation: 'modal', cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }} 
        />
        <Stack.Screen 
          name="Account" 
          component={AccountScreen} 
          options={{ title: 'ACCOUNT SECURITY', presentation: 'card' }} 
        />
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen} 
          options={{ title: 'PRIVACY CONFIGURATION', presentation: 'card' }} 
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen} 
          options={{ title: 'VEXTRO DEVICE LINK', presentation: 'modal' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}