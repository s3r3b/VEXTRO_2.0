// Ścieżka: /workspaces/VEXTRO/backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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

// Trasy API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Prosty testowy endpoint (Healthcheck)
app.get('/', (req, res) => {
    res.send('VEXTRO Backend is Online');
});

// Obsługa połączeń w czasie rzeczywistym
io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Pobieramy 50 najświeższych wiadomości
    try {
        const history = await Message.find()
            .sort({ timestamp: -1 }) // od najnowszych
            .limit(50);
        
        // Odwracamy tablicę dla UI mobilnego
        socket.emit('chat_history', history.reverse());
    } catch (err) {
        console.error('❌ Błąd przy pobieraniu historii:', err);
    }

    // Nasłuchiwanie nowych wiadomości
    socket.on('send_message', async (data) => {
        console.log('🔒 Zapisywanie wiadomości VEXTRO...');

        try {
            const newMessage = new Message({
                sender: data.sender,
                content: data.content
            });

            await newMessage.save(); // Zapis do MongoDB
            
            // Rozesłanie wiadomości do innych (oprócz nadawcy)
            socket.broadcast.emit('receive_message', data);
        } catch (err) {
            console.error('❌ Krytyczny błąd zapisu wiadomości:', err);
            // Tutaj system VEXTRO może w przyszłości wysłać feedback do nadawcy o niepowodzeniu
        }
    });
    
    // --- VEXTRO PREMIUM WEB AUTH (HANDSHAKE) ---
    // WebApp dekretuje klucz sesji i dołącza do prywatnego pokoju
    socket.on('init_web_session', (clientData) => {
        const SessionStore = require('./utils/SessionStore');
        const sessionId = SessionStore.createSession(socket.id);
        
        // WebApp dołącza do pokoju dla tej konkretnej sesji
        socket.join(sessionId);
        
        // Dynamiczny URL: WebApp przesyła swój origin, który jest routable z zewnątrz
        // (przez Vite proxy, tunel, lub bezpośredni IP)
        const serverUrl = (clientData && clientData.serverUrl) 
            ? clientData.serverUrl 
            : `http://localhost:${PORT}`;
        
        console.log(`🌐 [PREMIUM] WebApp zainicjowała sesję: [${sessionId}]`);
        console.log(`🌐 [PREMIUM] Server URL dla QR: ${serverUrl}`);
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

    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5050;

// '0.0.0.0' sprawia, że serwer akceptuje połączenia z KAŻDEGO adresu IP, 
// a nie tylko z wewnątrz kontenera.
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERWER VEXTRO OTWARTY NA ŚWIAT: port ${PORT}`);
    console.log(`📡 Dostępny pod Twoim IP: 192.168.18.2:${PORT}`);
});