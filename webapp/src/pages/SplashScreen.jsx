import { useEffect } from 'react';
import { motion } from 'framer-motion';
import GlitchLogo from '../components/effects/GlitchLogo';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    // Odczekaj 1s + czas na fade-out animację, zanim przekażesz kontrolę wyżej
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-background z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 1 }}
    >
      <GlitchLogo text="VEXTRO" />
    </motion.div>
  );
}
