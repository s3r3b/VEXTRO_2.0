// Ścieżka: /workspaces/VEXTRO/webapp/src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getTheme, applyTheme } from '../theme/themes';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'vextro_webapp_theme';

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'plasma'
  );

  const activeTheme = getTheme(themeId);

  // Aplikuj temat przy każdej zmianie
  useEffect(() => {
    applyTheme(activeTheme);
    localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId, activeTheme]);

  // Aplikuj przy pierwszym renderze (odtworzenie po reload)
  useEffect(() => {
    applyTheme(getTheme(localStorage.getItem(STORAGE_KEY) || 'plasma'));
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
