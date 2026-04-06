/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background, #040b14)',
        surface: 'rgba(15, 10, 30, 0.4)',
        surfaceBorder: 'var(--color-surface-border, rgba(191, 0, 255, 0.15))',
        primary: 'var(--color-primary, #bf00ff)',
        secondary: 'var(--color-secondary, #7000ff)',
        accent: 'var(--color-accent, #00f0ff)',
        textMain: '#ffffff',
        textMuted: '#8892b0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-primary': '0 0 20px rgba(191, 0, 255, 0.6)',
        'neon-secondary': '0 0 20px rgba(112, 0, 255, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 10px rgba(191, 0, 255, 0.8))' },
          '50%': { opacity: .6, filter: 'drop-shadow(0 0 22px rgba(191, 0, 255, 1))' },
        }
      }
    },
  },
  plugins: [],
}
