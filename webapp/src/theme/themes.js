// Ścieżka: /workspaces/VEXTRO/webapp/src/theme/themes.js

/**
 * VEXTRO WEBAPP AESTHETIC ENVIRONMENTS
 * Identyczne motywy co mobile (wallpapers.js) — pełna paryteta platform.
 * Kolory aplikowane przez CSS custom properties na :root.
 */
export const THEMES = {
  plasma: {
    id: 'plasma',
    label: 'Plasma Core',
    description: 'Neon Purple / Classic VEXTRO',
    background: '#040b14',
    primary: '#bf00ff',
    secondary: '#7000ff',
    accent: '#00f0ff',
    surfaceBorder: 'rgba(191, 0, 255, 0.15)',
    auraTop: 'rgba(191, 0, 255, 0.08)',
    auraBottom: 'rgba(0, 240, 255, 0.05)',
    thumb: ['#bf00ff', '#7000ff', '#00f0ff'],
  },
  void: {
    id: 'void',
    label: 'Deep Void',
    description: 'Monochrome / Zero Signature',
    background: '#030303',
    primary: '#e0e0e0',
    secondary: '#888888',
    accent: '#ffffff',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    auraTop: 'rgba(255, 255, 255, 0.03)',
    auraBottom: 'rgba(200, 200, 200, 0.02)',
    thumb: ['#e0e0e0', '#888888', '#ffffff'],
  },
  neon: {
    id: 'neon',
    label: 'Neon Grid',
    description: 'Acid Green / Hacker Terminal',
    background: '#020d05',
    primary: '#00ff41',
    secondary: '#008f11',
    accent: '#00ffcc',
    surfaceBorder: 'rgba(0, 255, 65, 0.15)',
    auraTop: 'rgba(0, 255, 65, 0.08)',
    auraBottom: 'rgba(0, 255, 204, 0.05)',
    thumb: ['#00ff41', '#008f11', '#00ffcc'],
  },
  ghost: {
    id: 'ghost',
    label: 'Ghost Shell',
    description: 'Cyber Blue / Stealth Protocol',
    background: '#020714',
    primary: '#0080ff',
    secondary: '#0040cc',
    accent: '#00cfff',
    surfaceBorder: 'rgba(0, 128, 255, 0.15)',
    auraTop: 'rgba(0, 128, 255, 0.08)',
    auraBottom: 'rgba(0, 207, 255, 0.05)',
    thumb: ['#0080ff', '#0040cc', '#00cfff'],
  },
};

export const getTheme = (id) => THEMES[id] || THEMES.plasma;

/**
 * Aplikuje motyw jako CSS custom properties na document.documentElement.
 * Tailwind classes odczytują je przez var() w tailwind.config.js.
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-surface-border', theme.surfaceBorder);
  root.style.setProperty('--color-aura-top', theme.auraTop);
  root.style.setProperty('--color-aura-bottom', theme.auraBottom);
  // Bezpośrednio body background (poza Tailwind)
  document.body.style.backgroundColor = theme.background;
}
