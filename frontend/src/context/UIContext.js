// Ścieżka: /workspaces/VEXTRO/frontend/src/context/UIContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VextroTheme } from '../theme/colors';
import { getWallpaper } from '../theme/wallpapers';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [fontSizeFactor, setFontSizeFactor] = useState(1.0);
  const [wallpaper, setWallpaper] = useState('plasma');
  const [enterSends, setEnterSends] = useState(true);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'neon' | 'cyber'

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('vextro_ui_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.fontSizeFactor) setFontSizeFactor(parsed.fontSizeFactor);
          if (parsed.wallpaper) setWallpaper(parsed.wallpaper);
          if (parsed.enterSends !== undefined) setEnterSends(parsed.enterSends);
          if (parsed.themeMode) setThemeMode(parsed.themeMode);
        }
      } catch (e) {
        console.error('Failed to load UI settings', e);
      }
    };
    loadSettings();
  }, []);

  // Save settings when changed
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = JSON.stringify({
          fontSizeFactor,
          wallpaper,
          enterSends,
          themeMode
        });
        await AsyncStorage.setItem('vextro_ui_settings', settings);
      } catch (e) {
        console.error('Failed to save UI settings', e);
      }
    };
    saveSettings();
  }, [fontSizeFactor, wallpaper, enterSends, themeMode]);

  const activeTheme = getWallpaper(wallpaper);

  const value = {
    fontSizeFactor,
    setFontSizeFactor,
    wallpaper,
    setWallpaper,
    enterSends,
    setEnterSends,
    themeMode,
    setThemeMode,
    activeTheme,          // <-- kompletny obiekt motywu
    theme: VextroTheme
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
