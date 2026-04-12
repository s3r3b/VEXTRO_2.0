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
      initial={{ opacity: 1, filter: 'blur(0px)' }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(15px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1 }}
    >
      <GlitchLogo text="VEXTRO" />
    </motion.div>
  );
}
