import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import QrPanel from '../components/ui/QrPanel';
import PhoneAuthPanel from '../components/ui/PhoneAuthPanel';
import NetworkConfig from '../services/NetworkConfig';
import { useShield } from '../context/ShieldContext';
import { cryptoCore } from '../utils/cryptoCore';
import { apiService } from '../services/apiService';
import StorageManager from '../utils/StorageManager';

export default function LoginScreen() {
  const [sessionId, setSessionId] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [status, setStatus] = useState('initializing');
  const [timeLeft, setTimeLeft] = useState(120);
  const [errorMessage, setErrorMessage] = useState('');
  const [customHubUrl, setCustomHubUrl] = useState(localStorage.getItem('vextro_custom_hub') || '');
  const [showHubConfig, setShowHubConfig] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { identity, isReady } = useShield();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(NetworkConfig.getSocketUrl(), { 
        transports: ['websocket'],
        extraHeaders: {
            'bypass-tunnel-reminder': 'true'
        }
    });

    const backendUrl = window.location.origin;

    socket.on('connect', () => {
       console.log("🌐 Desktop connected to VEXTRO Hub");
       socket.emit('init_web_session', { serverUrl: backendUrl });
    });

    socket.on('session_initialized', (data) => {
       const backendPort = 5050;
       const currentHost = window.location.hostname;
       const hubUrl = customHubUrl || `http://${currentHost}:${backendPort}`;
       
       setSessionId(data.sessionId);
       setServerUrl(hubUrl);
       setTimeLeft(data.expiresIn / 1000);
       setStatus('awaiting');
    });

    socket.on('web_session_authorized', async (data) => {
       setStatus('authorized');
       console.log("🔒 Autoryzacja udana!", data);
       
       const phone = data.userData?.phone || data.token;
       if (phone) {
         localStorage.setItem('userPhone', phone);
         
         try {
           try {
             await apiService.fetchReceiverKeys(phone);
             console.log("🔑 [X3DH] Klucze dla tego węzła już istnieją na serwerze.");
           } catch  {
             console.log("🔑 [X3DH] Brak kluczy na serwerze. Generowanie nowej paczki...");
             const { bundle, localKeys } = cryptoCore.generateX3DHBundle();
             await apiService.uploadKeys({
               phoneNumber: phone,
               identityKey: bundle.identityKey,
               signedPreKey: bundle.signedPreKey,
               oneTimePreKeys: bundle.oneTimePreKeys
             });
             localStorage.setItem('vextro_x3dh_local_keys', JSON.stringify(localKeys));
             console.log("🔑 [X3DH] Nowa paczka kluczy została pomyślnie wysłana!");
           }
         } catch (err) {
           console.error("🔑 [X3DH] Błąd podczas obsługi kluczy:", err);
         }
       }
       
       setTimeout(() => {
         socket.disconnect();
         navigate('/chat');
       }, 1500);
    });

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          socket.emit('init_web_session', { serverUrl: backendUrl });
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      socket.disconnect();
      clearInterval(timer);
    };
  }, [navigate, customHubUrl]);

  const handleManualAuthorize = async (data) => {
      console.log("🚀 [DEBUG] Przycisk kliknięty! Dane:", data);
      setErrorMessage('');
      
      try {
        setStatus('registering');

        if (authMode === 'register') {
          // ============================================================
          // FLOW REJESTRACJI — Atomiczny, E2EE-first
          // Krok 1: Wygeneruj pełny bundle X3DH po stronie klienta
          // Krok 2: Wyślij wszystko w JEDNYM requeście do backendu
          // Brak dwu-etapowego uploadu = brak race conditions
          // ============================================================
          
          console.log("🔑 [X3DH] Generowanie paczki tożsamości przed rejestracją...");
          const { bundle, localKeys } = cryptoCore.generateX3DHBundle();
          
          // Klucz tożsamości X3DH staje się "publicKey" w bazie danych
          const publicKey = bundle.identityKey;
          
          if (!publicKey) {
            throw new Error("Krytyczny błąd: cryptoCore nie wygenerował klucza tożsamości.");
          }

          console.log("🔑 [X3DH] Bundle gotowy. Inicjuję atomiczną rejestrację...");

          await axios.post(
            `${NetworkConfig.getSocketUrl()}/api/auth/register`,
            {
              phoneNumber: data.identifier,
              code: data.code,
              publicKey: publicKey,
              signedPreKey: bundle.signedPreKey,
              oneTimePreKeys: bundle.oneTimePreKeys,
            }
          );

          // Zapisz klucze prywatne TYLKO po potwierdzeniu sukcesu z serwera
          StorageManager.setUserPhone(data.identifier);
          StorageManager.setX3DHKeys(localKeys);
          StorageManager.setIdentityPublic(publicKey);

          console.log("✅ [X3DH] Rejestracja zakończona sukcesem. Klucze zapisane lokalnie.");

        } else {
          // ============================================================
          // FLOW LOGOWANIA — Weryfikacja + sprawdzenie kluczy lokalnych
          // ============================================================
          
          await axios.post(
            `${NetworkConfig.getSocketUrl()}/api/auth/login`,
            {
              phoneNumber: data.identifier,
              code: data.code,
            }
          );

          StorageManager.setUserPhone(data.identifier);

          const localKeys = StorageManager.getX3DHKeys();
          if (!localKeys) {
            console.warn("⚠️ [X3DH] Brak kluczy lokalnych na tym urządzeniu. Stare wiadomości będą nieczytelne.");
          } else {
            console.log("✅ [X3DH] Klucze lokalne znalezione. Sesja E2EE gotowa.");
          }
        }

        console.log(`🛡️ WebApp: ${authMode.toUpperCase()} SUCCESS.`);
        setStatus('authorized');

        setTimeout(() => {
          navigate('/chat');
        }, 1500);

      } catch (e) {
        console.error("KRYTYCZNY BŁĄD AUTORYZACJI:", e);
        const errorMsg = e.response?.data?.error || e.message || "Błąd komunikacji z VEXTRO Hub";
        setErrorMessage(errorMsg);
        setStatus('awaiting');
        // Czyścimy localStorage tylko jeśli rejestracja się nie powiodła
        // przy błędzie logowania nie czyścimy — klucze mogą już istnieć
        if (authMode === 'register') {
          StorageManager.clear(); // Atomic cleanup on registration error
        }
      }
  };

  const handleSaveHub = () => {
    localStorage.setItem('vextro_custom_hub', customHubUrl);
    setShowHubConfig(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#040b14] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="bg-orb w-[600px] h-[600px] bg-primary/10 top-[-20%] left-[-10%] animate-float"></div>
        <div className="bg-orb w-[500px] h-[500px] bg-accent/5 bottom-[-10%] right-[-10%] animate-float" style={{ animationDelay: '-5s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.8 }}
        className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left Pane: QR Sync */}
        <div className="flex flex-col items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex justify-center"
            >
                {status === 'initializing' ? (
                <div className="text-primary font-mono text-sm animate-pulse tracking-widest bg-white/[0.02] px-6 py-4 rounded-xl border border-white/5">
                    [ INITIALIZING_SECURE_VEXTRO_LINK... ]
                </div>
                ) : (
                <QrPanel 
                    value={sessionId ? `vextro://auth?token=${sessionId}&server=${encodeURIComponent(serverUrl || '')}` : 'VEXTRO_WAITING'} 
                    status={status}
                    timeLeft={timeLeft}
                />
                )}
            </motion.div>
        </div>

        <div className="hidden lg:block absolute left-1/2 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        {/* Right Pane: Phone Auth */}
        <div className="flex flex-col items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full flex flex-col items-center"
            >
                <div className="flex justify-center gap-4 mb-8 relative z-20">
                    <button 
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`px-6 py-2 rounded-lg font-orbitron text-[10px] tracking-[0.2em] transition-all duration-500 border backdrop-blur-md ${
                            authMode === 'login' 
                            ? 'bg-accent/20 border-accent/50 text-accent shadow-[0_0_20px_rgba(0,240,255,0.2)]' 
                            : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10 hover:text-white/60'
                        }`}
                    >
                        LOG-IN
                    </button>
                    <button 
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`px-6 py-2 rounded-lg font-orbitron text-[10px] tracking-[0.2em] transition-all duration-500 border backdrop-blur-md ${
                            authMode === 'register' 
                            ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_20px_rgba(255,42,85,0.2)]' 
                            : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10 hover:text-white/60'
                        }`}
                    >
                        CREATE ACCOUNT
                    </button>
                </div>
                
                {/* Wpięty komponent autoryzacji! */}
                <PhoneAuthPanel 
                    onAuthorize={handleManualAuthorize}
                    buttonText={authMode === 'register' ? 'INITIALIZE_IDENTITY' : 'VERIFY_ACCESS'}
                />

            </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {(status === 'authorized' || status === 'registering') && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center backdrop-blur-xl"
            >
                <motion.div 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="text-center"
                >
                    <div className="text-accent font-orbitron text-3xl mb-4 tracking-[0.4em] drop-shadow-neon-accent">
                        {status === 'registering' ? 'SYNCHRONIZING...' : 'ACCESS_GRANTED'}
                    </div>
                    {errorMessage ? (
                      <div className="text-red-500 font-mono text-xs uppercase tracking-widest mt-4">
                        ERROR: {errorMessage}
                      </div>
                    ) : (
                      <>
                        <div className="w-64 h-[1px] bg-white/10 mx-auto relative overflow-hidden">
                            <motion.div 
                                className="absolute inset-0 bg-accent shadow-[0_0_15px_#00f0ff]"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        </div>
                        <p className="mt-6 text-white/40 font-mono text-[10px] tracking-widest uppercase">
                            Establishing encrypted tunnel to nodes...
                        </p>
                      </>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}