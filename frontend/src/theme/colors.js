// Ścieżka: /workspaces/VEXTRO/frontend/src/theme/colors.js

/**
 * VEXTRO 3.0 PREMIUM COLOR PALETTE
 * Pełna synchronizacja z systemem webapp (Tailwind Design System).
 * Kolory dobrane pod kątem wyświetlaczy OLED i wysokiego kontrastu.
 */
export const VextroTheme = {
    // Tło główne - głęboka kosmiczna czerń z odcieniem granatu
    background: '#040b14', 
    
    // Warstwy szklane (Glassmorphism)
    surface: 'rgba(15, 10, 30, 0.4)',
    surfaceBorder: 'rgba(191, 0, 255, 0.15)',
    
    // Główny akcent - Neon Purple
    primary: '#bf00ff', 
    primaryGlow: 'rgba(191, 0, 255, 0.4)',
    
    // Akcenty sekundarne i dopełniające
    secondary: '#7000ff', 
    accent: '#00f0ff', // Cyber Cyan
    
    // Typografia
    text: '#ffffff',
    textMuted: '#8892b0',
    
    // Statusy systemowe
    error: '#ff0055',
    success: '#00f0ff',
    
    // Konfiguracja Glassmorphism
    blur: {
        amount: 20,
        intensity: 'dark'
    },
    
    shadows: {
        neon: {
            shadowColor: "#bf00ff",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10
        }
    }
};