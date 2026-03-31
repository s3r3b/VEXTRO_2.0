import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

export default function QrPanel({ value, status, timeLeft }) {
  const isAwaiting = status === 'awaiting';
  const progress = (timeLeft / 120) * 100;

  return (
    <motion.div 
      className="relative p-8 glass-panel flex flex-col items-center max-w-sm w-full outline outline-1 outline-white/5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold font-sans text-primary drop-shadow-neon-primary mb-2">VEXTRO SYNC</h2>
        <p className="text-xs text-secondary font-mono tracking-wider opacity-80 uppercase">
          {status === 'authorized' ? 'Secure Link Established' : 'Awaiting Authorization'}
        </p>
      </div>

      {/* QR Code Canvas Premium styling */}
      <div className="relative p-4 bg-white/[0.02] rounded-xl border border-white/5 shadow-[0_0_25px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden">
        {/* Narożniki cyberpunkowe */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary -ml-1 -mt-1 rounded-tl opacity-50"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary -mr-1 -mt-1 rounded-tr opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary -ml-1 -mb-1 rounded-bl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary -mr-1 -mb-1 rounded-br opacity-50"></div>
        
        <div className={`transition-all duration-700 ${status === 'authorized' ? 'blur-xl scale-95 opacity-20' : 'opacity-100'}`}>
          <QRCodeSVG 
            value={value}
            size={220}
            bgColor={"transparent"}
            fgColor={"#ffffff"}
            level={"H"}
            imageSettings={{
              src: "/favicon.svg",
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>

        {status === 'authorized' && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Timer / Progress Bar */}
      <div className="mt-8 w-full">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Session Lifetime</span>
          <span className="text-[10px] font-mono text-primary">{Math.floor(timeLeft)}s</span>
        </div>
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary shadow-[0_0_8px_#00f0ff]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      </div>

      <p className="mt-6 text-[10px] text-white/40 font-mono text-center leading-relaxed">
        Skanuj kod dedykowaną aplikacją VEXTRO aby uzyskać dostęp do terminala.
      </p>
    </motion.div>
  );
}
