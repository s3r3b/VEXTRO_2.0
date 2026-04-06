import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import ChatScreen from './pages/ChatScreen';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
    <Router>
      <div className="relative w-full h-[100dvh] overflow-hidden bg-background font-sans text-textMain selection:bg-primary/30">
        
        <AnimatePresence mode="wait">
          {showSplash && (
            <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
          )}
        </AnimatePresence>

        {/* Sekcja główna ładowana w tle (ukryta via z-index i opóźnienia lub po prostu renderowana, splash ją przykrywa) */}
        {!showSplash && (
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
    </ThemeProvider>
  );
}
