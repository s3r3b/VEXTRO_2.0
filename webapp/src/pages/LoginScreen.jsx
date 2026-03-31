import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import QrPanel from '../components/ui/QrPanel';
import NetworkConfig from '../services/NetworkConfig';

export default function LoginScreen() {
  const [sessionId, setSessionId] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [status, setStatus] = useState('initializing'); // initializing, awaiting, detected, authorized
  const [timeLeft, setTimeLeft] = useState(120);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(NetworkConfig.getSocketUrl(), { 
        transports: ['websocket'],
        extraHeaders: {
            'bypass-tunnel-reminder': 'true'
        }
    });

    // Obliczamy publiczny URL backendu z perspektywy przeglądarki
    // W dev: Vite proxy → window.location.origin
    // W produkcji/tunelu: to samo — origin jest routable
    const backendUrl = window.location.origin;

    socket.on('connect', () => {
       console.log("🌐 Desktop connected to VEXTRO Hub");
       socket.emit('init_web_session', { serverUrl: backendUrl });
    });

    socket.on('session_initialized', (data) => {
       setSessionId(data.sessionId);
       setServerUrl(data.serverUrl || backendUrl);
       setTimeLeft(data.expiresIn / 1000);
       setStatus('awaiting');
    });

    socket.on('web_session_authorized', (data) => {
       setStatus('authorized');
       console.log("🔒 Autoryzacja udana!", data);
       
       // Krótkie opóźnienie dla efektu wizualnego
       setTimeout(() => {
         socket.disconnect();
         navigate('/chat');
       }, 1500);
    });

    // Cleanup i timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          socket.emit('init_web_session', { serverUrl: backendUrl }); // Auto-refresh
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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#0a0a0a]">
      {/* Dynamic Background Noise/Effects */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="z-10 w-full flex justify-center">
        {status === 'initializing' ? (
          <div className="text-primary font-mono animate-pulse">
            [ INITIALIZING VEXTRO SECURE CHANNEL... ]
          </div>
        ) : (
          <QrPanel 
            value={sessionId ? `vextro://auth?token=${sessionId}&server=${encodeURIComponent(serverUrl || '')}` : 'VEXTRO_WAITING'} 
            status={status}
            timeLeft={timeLeft}
          />
        )}
      </div>

      {status === 'authorized' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
             <div className="text-secondary font-mono text-xl animate-bounce mb-4">
                AUTHENTICATED
             </div>
             <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-secondary animate-[loading_1.5s_ease-in-out]"></div>
             </div>
        </div>
      )}
    </div>
  );
}
