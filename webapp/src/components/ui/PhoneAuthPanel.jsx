import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhoneAuthPanel({ onAuthorize, buttonText }) {
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    console.log("🎯 [TEST GUZIKA] Kliknięto! Krok:", step, "| Numer:", phoneNumber);

    if (step === 'phone') {
      if (!phoneNumber || phoneNumber.length < 5) {
        console.warn("🛑 Zablokowano: Pole numeru telefonu jest puste lub za krótkie!");
        return; 
      }
      console.log("✅ Wpisano numer. Przełączam na widok PIN...");
      setIsLoading(true);
      setTimeout(() => {
        setStep('otp');
        setIsLoading(false);
      }, 500);
    } else {
      console.log("🚀 [PANEL] Wysyłam dane (Numer + Kod) do centrali!");
      if (otp.length < 4) {
          console.warn("🛑 Zablokowano: Wpisano za krótki PIN!");
          return;
      }
      onAuthorize({ method: 'phone', identifier: phoneNumber, code: otp });
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-orbitron font-bold text-accent drop-shadow-neon-secondary mb-2 uppercase tracking-widest">
          {step === 'phone' ? 'Identity' : 'Verify'}
        </h2>
        <p className="text-[10px] text-white/40 font-mono uppercase tracking-tighter">
          {step === 'phone' ? 'Enter your global identifier' : 'Enter the 4-digit pulse code'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div 
            key="phone-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="relative group">
              <input 
                type="tel"
                placeholder="+48 --- --- ---"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-lg font-mono focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all duration-300 text-white"
              />
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
            </div>

            <button 
              type="button" 
              onClick={handleNext}
              disabled={isLoading}
              className={`w-full py-4 text-sm font-orbitron tracking-[0.2em] transition-all duration-500 overflow-hidden relative group border ${!phoneNumber ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' : 'glass-panel-light hover:bg-primary/20 hover:border-primary/30 text-white'}`}
            >
              <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                  {buttonText || 'REQUEST_ACCESS'} 
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3].map((i) => (
                <input 
                  key={i}
                  type="text"
                  maxLength="1"
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d?$/.test(val)) {
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                      if (val && i < 3) {
                         e.target.nextSibling?.focus();
                      }
                    }
                  }}
                  className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-xl text-center text-2xl font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(191,0,255,0.3)] transition-all duration-300 text-white"
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`w-full py-4 text-sm font-orbitron tracking-[0.2em] rounded-xl transition-all duration-300 text-white ${otp.length < 4 ? 'bg-primary/40 opacity-50 cursor-not-allowed' : 'bg-primary/80 hover:bg-primary shadow-neon-primary'}`}
              >
                AUTHORIZE_SESSION
              </button>
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Change identifier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}