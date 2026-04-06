// Ścieżka: /workspaces/VEXTRO/frontend/src/theme/wallpapers.js

/**
 * VEXTRO AESTHETIC ENVIRONMENTS
 * Każdy motyw definiuje kompletny system kolorów:
 * - tło, primary, secondary, accent
 * - kolory aur (CyberBackground gradients)
 * - kolory szkła (GlassView)
 * - preview thumbnail colors (dla IS picker)
 */
export const WALLPAPERS = {
  plasma: {
    id: 'plasma',
    label: 'Plasma Core',
    description: 'Neon Purple / Classic VEXTRO',
    // App colors
    background: '#040b14',
    primary: '#bf00ff',
    secondary: '#7000ff',
    accent: '#00f0ff',
    surfaceBorder: 'rgba(191, 0, 255, 0.15)',
    // CyberBackground auras
    auraTop: ['rgba(191, 0, 255, 0.10)', 'transparent'],
    auraBottom: ['transparent', 'rgba(0, 240, 255, 0.06)'],
    // Thumbnail preview colors
    thumb: ['#bf00ff', '#7000ff', '#040b14'],
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
    auraTop: ['rgba(255, 255, 255, 0.04)', 'transparent'],
    auraBottom: ['transparent', 'rgba(200, 200, 200, 0.03)'],
    thumb: ['#2a2a2a', '#111111', '#030303'],
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
    auraTop: ['rgba(0, 255, 65, 0.10)', 'transparent'],
    auraBottom: ['transparent', 'rgba(0, 255, 204, 0.06)'],
    thumb: ['#00ff41', '#008f11', '#020d05'],
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
    auraTop: ['rgba(0, 128, 255, 0.10)', 'transparent'],
    auraBottom: ['transparent', 'rgba(0, 207, 255, 0.06)'],
    thumb: ['#0080ff', '#0040cc', '#020714'],
  },
};

export const getWallpaper = (id) => WALLPAPERS[id] || WALLPAPERS.plasma;
