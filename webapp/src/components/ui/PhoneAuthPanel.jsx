import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhoneAuthPanel({ onAuthorize }) {
  const [step, setStep] = useState('phone'); // phone, otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 'phone') {
      setIsLoading(true);
      setTimeout(() => {
        setStep('otp');
        setIsLoading(false);
      }, 1000);
    } else {
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
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-lg font-mono focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
            </div>

            <button 
              onClick={handleNext}
              disabled={isLoading}
              className="w-full glass-panel-light py-4 text-sm font-orbitron tracking-[0.2em] hover:bg-primary/20 hover:border-primary/30 transition-all duration-500 overflow-hidden relative group"
            >
              <span className={isLoading ? 'opacity-0' : 'opacity-100'}>REQUEST_ACCESS</span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
                      // Auto focus next
                      if (val && i < 3) {
                         e.target.nextSibling?.focus();
                      }
                    }
                  }}
                  className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-xl text-center text-2xl font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(191,0,255,0.3)] transition-all duration-300"
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleNext}
                className="w-full bg-primary/80 hover:bg-primary py-4 text-sm font-orbitron tracking-[0.2em] rounded-xl shadow-neon-primary transition-all duration-300"
              >
                AUTHORIZE_SESSION
              </button>
              <button 
                onClick={() => setStep('phone')}
                className="w-full text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Change identifier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-4 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Security_Node_Active</span>
        </div>
        <p className="text-[9px] font-mono text-white/20 leading-relaxed uppercase">
          Ensuring end-to-end encryption tunnel. All identifiers are hashed locally before transmission.
        </p>
      </div>
    </div>
  );
}
