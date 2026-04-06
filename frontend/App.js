// Ścieżka: /workspaces/VEXTRO/frontend/App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import AISettingsScreen from './src/screens/AISettingsScreen';
import AccountScreen from './src/screens/AccountScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import InterfaceSynthesisScreen from './src/screens/InterfaceSynthesisScreen';
import SelectContactScreen from './src/screens/SelectContactScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import GroupChatScreen from './src/screens/GroupChatScreen';
import TerminalScreen from './src/screens/TerminalScreen';
import { UIProvider } from './src/context/UIContext';
import { ShieldProvider } from './src/context/ShieldContext';

const Stack = createStackNavigator();

export default function App() {
  const [isLogged, setIsLogged] = useState(null);

  useEffect(() => {
    const init = async () => {
      // 1. Sprawdzenie logowania
      const phone = await AsyncStorage.getItem('userPhone');
      setIsLogged(!!phone);
    };
    init();
  }, []);

  if (isLogged === null) return null; // Ekran ładowania

  return (
    <SafeAreaProvider>
    <ShieldProvider>
      <UIProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName={isLogged ? "Main" : "Login"}
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#040b14' },
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Main" component={ContactsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            {/* ... other screens ... */}
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="AISettings" component={AISettingsScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
            <Stack.Screen name="InterfaceSynthesis" component={InterfaceSynthesisScreen} />
            <Stack.Screen name="SelectContact" component={SelectContactScreen} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="GroupChat" component={GroupChatScreen} />
            <Stack.Screen name="Terminal" component={TerminalScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UIProvider>
    </ShieldProvider>
    </SafeAreaProvider>
  );
}