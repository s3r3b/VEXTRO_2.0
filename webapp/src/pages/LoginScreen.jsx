import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import QrPanel from '../components/ui/QrPanel';
import PhoneAuthPanel from '../components/ui/PhoneAuthPanel';
import NetworkConfig from '../services/NetworkConfig';
import { useShield } from '../context/ShieldContext';

export default function LoginScreen() {
  const [sessionId, setSessionId] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [status, setStatus] = useState('initializing'); // initializing, awaiting, detected, authorized, registering
  const [timeLeft, setTimeLeft] = useState(120);
  const [errorMessage, setErrorMessage] = useState('');
  const [customHubUrl, setCustomHubUrl] = useState(localStorage.getItem('vextro_custom_hub') || '');
  const [showHubConfig, setShowHubConfig] = useState(false);
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
       const backendPort = 5050; // Domyślny port VEXTRO Hub
       const currentHost = window.location.hostname;
       const hubUrl = customHubUrl || `http://${currentHost}:${backendPort}`;
       
       setSessionId(data.sessionId);
       setServerUrl(hubUrl);
       setTimeLeft(data.expiresIn / 1000);
       setStatus('awaiting');
    });

    socket.on('web_session_authorized', (data) => {
       setStatus('authorized');
       console.log("🔒 Autoryzacja udana!", data);
       
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
  }, [navigate]);

  const handleManualAuthorize = async (data) => {
    setErrorMessage('');
    
    // Zapisanie sesji lokalnej
    localStorage.setItem('userPhone', data.identifier);

    // Aby umożliwić odnalezienie tego kontaktu z innych urządzeń i P2P
    try {
       setStatus('registering');
       
       // Upewnij się, że klucze Shield są wygenerowane
       const pubKey = identity?.publicKey || localStorage.getItem('vextro_identity_public');
       
       if (!pubKey) {
          throw new Error("Błąd Inicjalizacji Shield: Brak kluczy tożsamości.");
       }

       // Rejestracja w bazie centralnej
       await axios.post(`${NetworkConfig.getSocketUrl()}/api/auth/verify-code`, {
         phoneNumber: data.identifier,
         code: data.code, // Używamy realnego kodu z UI
         publicKey: pubKey
       });

       console.log("🛡️ WebApp Node Registered successfully.");
       setStatus('authorized');
       
       setTimeout(() => {
         navigate('/chat');
       }, 1500);

    } catch (e) {
       console.error("KRYTYCZNY BŁĄD REJESTRACJI:", e);
       setErrorMessage(e.response?.data?.error || e.message || "Błąd synchronizacji z VEXTRO Hub");
       setStatus('awaiting'); // Cofnij do wyboru numeru
       localStorage.removeItem('userPhone');
    }
  };

  const handleSaveHub = () => {
    localStorage.setItem('vextro_custom_hub', customHubUrl);
    setShowHubConfig(false);
    // Restart session to apply new URL to QR
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#040b14] overflow-hidden">
      {/* Background Kinetic Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="bg-orb w-[600px] h-[600px] bg-primary/10 top-[-20%] left-[-10%] animate-float"></div>
        <div className="bg-orb w-[500px] h-[500px] bg-accent/5 bottom-[-10%] right-[-10%] animate-float" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Main Login Interface */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
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

            {/* TUNNEL/HUB OVERRIDE (For Ngrok/LAN Issues) */}
            <div className="mt-8 w-full max-w-xs">
                {!showHubConfig ? (
                    <button 
                        onClick={() => setShowHubConfig(true)}
                        className="text-[9px] font-mono text-white/20 hover:text-primary transition-colors tracking-widest uppercase"
                    >
                        [ CONFIG_NODE_OVERRIDE ]
                    </button>
                ) : (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                        <p className="text-[9px] font-mono text-primary tracking-widest uppercase">TUNNEL_ADDRESS (Ngrok/IP):</p>
                        <input 
                            type="text"
                            value={customHubUrl}
                            onChange={(e) => setCustomHubUrl(e.target.value)}
                            placeholder="https://xyz.ngrok-free.app"
                            className="w-full bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white font-mono outline-none focus:border-primary/40"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSaveHub} className="flex-1 bg-primary/20 text-primary p-2 rounded text-[9px] font-bold uppercase hover:bg-primary/30 transition-all">SAVE_RELOAD</button>
                            <button onClick={() => setShowHubConfig(false)} className="flex-1 bg-white/5 text-white/40 p-2 rounded text-[9px] font-bold uppercase hover:bg-white/10">CANCEL</button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Vertical Divider (Desktop Only) */}
        <div className="hidden lg:block absolute left-1/2 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        {/* Right Pane: Phone Auth */}
        <div className="flex flex-col items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full flex justify-center"
            >
                <div className="w-full max-w-sm glass-panel-heavy p-10 relative overflow-hidden group">
                    {/* Inner Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-700"></div>
                    
                    <PhoneAuthPanel onAuthorize={handleManualAuthorize} />
                </div>
            </motion.div>
        </div>
      </motion.div>

      {/* Success / Registering Overlay */}
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
