import { motion } from 'framer-motion';

export default function GlitchLogo({ text }) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0, filter: 'blur(20px)' }}
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom expo out
      }}
    >
      <motion.h1 
        className="text-5xl md:text-7xl font-mono font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-neon-primary"
        animate={{
          x: [-2, 2, -1, 1, 0],
          y: [1, -1, 2, -2, 0],
          opacity: [1, 0.8, 1, 0.9, 1]
        }}
        transition={{
          duration: 0.2,
          delay: 0.6, // Uruchomienie efektu glitch tuż przed zniknięciem
          repeat: 2,
          repeatType: "reverse"
        }}
      >
        {text}
      </motion.h1>
      
      {/* Cień rozmyty w tle z Framer Motion */}
      <motion.div
        className="absolute inset-0 bg-primary blur-[80px] opacity-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1.5 }}
        transition={{ duration: 1, delay: 0.2 }}
      />
    </motion.div>
  );
}
