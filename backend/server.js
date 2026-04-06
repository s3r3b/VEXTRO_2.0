// Ścieżka: /workspaces/VEXTRO/backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Inicjalizacja zmiennych środowiskowych
dotenv.config({ path: './.env' });

// Walidacja krytycznych zmiennych przed startem (KILL-SWITCH)
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("💀 BŁĄD KRYTYCZNY: Brak MONGO_URI w pliku .env!");
    console.error("Serwer VEXTRO odmawia startu w celu ochrony spójności danych.");
    process.exit(1); 
}

const Message = require('./models/Message');

// Połączenie z MongoDB Atlas
mongoose.connect(mongoURI)
  .then(() => console.log("🔥 VEXTRO połączone z MongoDB!"))
  .catch(err => {
      console.error("❌ Błąd połączenia z MongoDB:", err);
      process.exit(1);
  });

const app = express();
const server = http.createServer(app);

// Konfiguracja Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // W wersji dev pozwalamy na połączenia z Expo Go
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serwowanie zaszyfrowanych binarów

// Trasy API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/media', require('./routes/media')); // Nowa trasa dla audio/obrazów

// Prosty testowy endpoint (Healthcheck)
app.get('/', (req, res) => {
    res.send('VEXTRO Backend is Online');
});

// Endpoint autodiscovery dla podłączonych węzłów
let publicTunnelUrl = null;
app.get('/api/config/network', (req, res) => {
    res.json({
        success: true,
        tunnelUrl: publicTunnelUrl,
        localUrl: `http://localhost:${PORT}`,
        timestamp: new Date().toISOString()
    });
});

// Obsługa połączeń w czasie rzeczywistym
io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Dołączanie do zabezpieczonego pokoju E2EE (1:1 lub Grupa)
    socket.on('join_room', async ({ roomId }) => {
        if (!roomId) return;
        socket.join(roomId);
        console.log(`🔒 [Room] Web socket ${socket.id} dołączył do pokoju: ${roomId}`);

        try {
            const history = await Message.find({ roomId })
                .sort({ timestamp: -1 })
                .limit(50);
            // Wysyłamy TYLKO do klienta, który właśnie dołączył (czyli podajemy listę wiadomości do rendera)
            socket.emit('chat_history', history.reverse());
        } catch (err) {
            console.error('❌ Błąd przy pobieraniu historii:', err);
        }
    });

    // Nasłuchiwanie 1:1 wiadomości z kierowaniem DO POKOJU (załatany nieszczelny kanał)
    socket.on('send_message', async (data) => {
        try {
            if (!data.roomId) {
                console.error("❌ Odrzucono wiadomość - brak ROOM ID");
                return;
            }

            const newMessage = new Message({
                roomId: data.roomId,
                sender: data.sender,
                content: data.content
            });
            await newMessage.save();

            // Zaktualizuj Contact
            const Contact = require('./models/Contact');
            const User = require('./models/User');
            const phones = data.roomId.split('-');
            
            if (phones.length === 2) {
               const receiverPhone = phones[0] === data.sender ? phones[1] : phones[0];

               // Update each other's contact "lastMessage" to reflect activity
               await Contact.updateMany(
                 { 
                   $or: [
                     { ownerPhone: phones[0], contactPhone: phones[1] },
                     { ownerPhone: phones[1], contactPhone: phones[0] }
                   ]
                 },
                 { 'lastMessage.content': data.content, 'lastMessage.timestamp': new Date() }
               );

               // WYSYŁKA PUSH NOTIFICATION (Jeżeli odbiorca nie wyciszył nadawcy)
               const receiverContactEntry = await Contact.findOne({ ownerPhone: receiverPhone, contactPhone: data.sender });
               if (!receiverContactEntry || !receiverContactEntry.isMuted) {
                  const receiverUser = await User.findOne({ phoneNumber: receiverPhone });
                  if (receiverUser && receiverUser.expoPushToken) {
                      // Wysyłanie do Expo Push API (Bezpieczna, zanonimizowana wiadomość)
                      try {
                          await fetch('https://exp.host/--/api/v2/push/send', {
                              method: 'POST',
                              headers: {
                                  'Accept': 'application/json',
                                  'Accept-encoding': 'gzip, deflate',
                                  'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                  to: receiverUser.expoPushToken,
                                  sound: 'default',
                                  title: 'VEXTRO SECURE CHANNEL',
                                  body: 'Zaszyfrowana przesyłka oczekuje na odbiór 🛡️',
                                  data: { roomId: data.roomId },
                              })
                          });
                          console.log(`📲 [PUSH] Wysłano notyfikację do: ${receiverPhone}`);
                      } catch(pushErr) {
                          console.error("Błąd wysyłki PUSH:", pushErr);
                      }
                  }
               }
            }

            // Wysyłamy wyłącznie do uczestników pokoju
            socket.to(data.roomId).emit('receive_message', data);
        } catch (err) {
            console.error('❌ Krytyczny błąd zapisu wiadomości:', err);
        }
    });

    // Obsługa Wiadomości Grupowych (Sender/Group Key)
    socket.on('send_group_message', async (data) => {
        try {
            if (!data.roomId) return;
            
            // Wysyłanie paczki wyłącznie do podsieci grupowego pokoju
            socket.to(data.roomId).emit('receive_group_message', data);

            // Zaktualizuj meta ostatniej wiadomości (Group.lastMessage) - opcjonalnie
            const Group = require('./models/Group');
            const User = require('./models/User');
            
            const groupData = await Group.findByIdAndUpdate(data.roomId, {
                'lastMessage.content': data.content, // Zaszyfrowane, ale pozwala pokazać na urządzeniu powiadomienie "Wiadomość zablokowana hasłem"
                'lastMessage.timestamp': new Date()
            }, { new: true });

            if (groupData && groupData.members) {
                 // Push powiadomienia dla pozostałych członków (którzy nie są Senderem)
                 for (let memberPhone of groupData.members) {
                     if (memberPhone === data.sender) continue;
                     
                     // Tu moglibyśmy dodac flagi "Czy gość wyciszył grupę". Gdy tylko Group.js dostanie takie uprawnienia, zablokujemy stąd.
                     const receiverUser = await User.findOne({ phoneNumber: memberPhone });
                     if (receiverUser && receiverUser.expoPushToken) {
                         try {
                              await fetch('https://exp.host/--/api/v2/push/send', {
                                  method: 'POST',
                                  headers: {
                                      'Accept': 'application/json',
                                      'Accept-encoding': 'gzip, deflate',
                                      'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                      to: receiverUser.expoPushToken,
                                      sound: 'default',
                                      title: `VEXTRO: ${groupData.groupName}`,
                                      body: 'Zaszyfrowana przesyłka oczekuje na odbiór 🛡️',
                                      data: { roomId: data.roomId },
                                  })
                              });
                          } catch(pushErr) {}
                     }
                 }
            }

        } catch (err) {
            console.error('❌ Krytyczny błąd obsługi grupy:', err);
        }
    });
    
    // --- VEXTRO PREMIUM WEB AUTH (HANDSHAKE) ---
    // WebApp dekretuje klucz sesji i dołącza do prywatnego pokoju
    socket.on('init_web_session', (clientData) => {
        const SessionStore = require('./utils/SessionStore');
        const sessionId = SessionStore.createSession(socket.id);
        
        // WebApp dołącza do pokoju dla tej konkretnej sesji
        socket.join(sessionId);
        
        // Dynamiczny URL (PRIORYTET: Tunel Publiczny Ngrok)
        const serverUrl = publicTunnelUrl || (clientData && clientData.serverUrl) || `http://localhost:${PORT}`;
        
        console.log(`🌐 [PREMIUM] WebApp zainicjowała sesję: [${sessionId}]`);
        console.log(`🌐 [PREMIUM] Target Hub Discovery URL: ${serverUrl}`);

        // Przesyłamy token sesji z powrotem do WebApp, by mogła wygenerować QR
        socket.emit('session_initialized', {
            sessionId: sessionId,
            expiresIn: 120000, // 120 sekundy
            serverUrl: serverUrl
        });
    });

    // Aplikacja Mobilna (VEXTRO sprzętowe) rzuca sygnał zautoryzowania
    socket.on('authorize_web_session', (data) => {
        const SessionStore = require('./utils/SessionStore');
        const { sessionId, userToken, userData } = data;
        
        console.log(`📱 [Skaner] Próba autoryzacji sesji: [${sessionId}]`);
        
        const result = SessionStore.authorize(sessionId, userData || { phone: userToken });

        if (result.success) {
            console.log(`✅ [Skaner] Autoryzacja potwierdzona dla Kanału: [${sessionId}]`);
            
            // Sygnał "Otwierać drzwi!" leci tylko do WebApp zamkniętej w konkretnym pokoju
            io.to(sessionId).emit('web_session_authorized', {
                status: 'success',
                message: 'VEXTRO Premium Universal Sync successful.',
                token: userToken || 'AUTHORIZED_SESSION_KEY_001',
                userData: userData || { phone: userToken }
            });

            // Usuwamy sesję z pamięci, bo została zużyta (bezpieczeństwo jednorazowego skanu)
            SessionStore.destroy(sessionId);
        } else {
            console.warn(`❌ [Skaner] Błąd autoryzacji sesji [${sessionId}]: ${result.error}`);
            socket.emit('auth_error', { error: result.error });
        }
    });
    // -----------------------------------

    // --- VEXTRO ADMIN SHELL (GOD MODE) ---
    // Terminal dla administratora +48798884532
    let adminShell = null;

    socket.on('request_terminal', (data) => {
        const adminPhone = '+48798884532';
        if (data.phoneNumber !== adminPhone) {
            console.warn(`🛑 [SECURITY] Nieautoryzowana próba dostępu do terminala przez: ${data.phoneNumber}`);
            socket.emit('terminal_error', { error: 'BRAK UPRAWNIEŃ DOSTĘPU' });
            return;
        }

        console.log(`📡 [SHELL] Otwieranie powłoki BASH dla administratora: ${data.phoneNumber}`);

        // Spawning interactive shell process
        adminShell = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: '/workspaces/VEXTRO',
            env: process.env
        });

        // Pipe output from shell to socket
        adminShell.onData((outputData) => {
            socket.emit('terminal_output', outputData);
        });

        // Log exit
        adminShell.onExit(({ exitCode, signal }) => {
            console.log(`📡 [SHELL] Powłoka BASH zakończona: ${exitCode}`);
            socket.emit('terminal_exit', { exitCode, signal });
            adminShell = null;
        });

        socket.emit('terminal_ready');
    });

    socket.on('terminal_input', (inputData) => {
        if (adminShell) {
            adminShell.write(inputData);
        }
    });

    socket.on('resize_terminal', (data) => {
        if (adminShell) {
            adminShell.resize(data.cols, data.rows);
        }
    });

    socket.on('disconnect', () => {
        if (adminShell) {
            console.log(`📡 [SHELL] Zamykanie sessions admina po rozłączeniu socketu.`);
            adminShell.kill();
            adminShell = null;
        }
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5050;

// '0.0.0.0' sprawia, że serwer akceptuje połączenia z KAŻDEGO adresu IP, 
// a nie tylko z wewnątrz kontenera.
server.listen(PORT, '0.0.0.0', async () => {
    console.log("🚀 SERWER VEXTRO OTWARTY NA ŚWIAT: port " + PORT);
    
    // --- INTEGRACJA NGROK (MODE PREMIUM) ---
    try {
        const ngrok = require('ngrok');
        const token = process.env.NGROK_AUTHTOKEN;
        
        if (token) {
            console.log("🔑 Znaleziono NGROK_AUTHTOKEN - startuję w trybie PREMIUM.");
            await ngrok.authtoken(token);
        } else {
            console.warn("⚠️ Brak NGROK_AUTHTOKEN - startuję w trybie FREE (sesje wygasają po 2h).");
        }

        publicTunnelUrl = await ngrok.connect({
            addr: Number(PORT)
        });
        
        console.log("------------------------------------------");
        console.log(`💎 VEXTRO GLOBAL TUNNEL: ${publicTunnelUrl}`);
        console.log("------------------------------------------");

    } catch (err) {
        console.error("❌ BŁĄD INTEGRACJI NGROK:", err.message);
        console.log("Kontynuuję start bez tunelu publicznego.");
    }
});
