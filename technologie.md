# Analiza Technologiczna Projektu VEXTRO

Na podstawie plików konfiguracyjnych w obszarze roboczym `/workspaces/VEXTRO`, oto lista użytych technologii, paczek (rozszerzeń) oraz języków programowania:

## Języki Programowania
- **JavaScript** (główny język używany zarówno w backendzie, jak i we frontendzie środowiska Node.js / React Native)

## Technologie i Frameworki
- **Node.js** (środowisko uruchomieniowe)
- **React Native** (tworzenie aplikacji mobilnych/webowych)
- **Expo** (zestaw narzędzi roboczych dla React Native)
- **Express.js** (framework webowy dla Node.js dający infrastrukturę serwerową)
- **MongoDB** (baza danych typu NoSQL)

## Rozszerzenia / Biblioteki (Zależności)

### 🖥️ Backend (`/workspaces/VEXTRO/backend`)
- `express` - Serwer HTTP
- `mongoose` - Modelowanie danych dla MongoDB (ODM)
- `socket.io` - Komunikacja w czasie rzeczywistym (WebSockets)
- `cors` - Obsługa mechanizmu współdzielenia zasobów między źródłami (CORS)
- `crypto-js` - Funkcje kryptograficzne do szyfrowania i haszowania
- `dotenv` - Ładowanie zmiennych środowiskowych z plików `.env`
- `nodemon` (devDependencies) - Automatyczne restartowanie serwera w trakcie pracy deweloperskiej

### 📱 Frontend (`/workspaces/VEXTRO/frontend`)
- `react`, `react-native`, `react-dom`, `react-native-web` - Główne biblioteki do budowy interfejsu
- `expo`, `expo-status-bar`, `expo-crypto`, `expo-image-picker` - Moduły z ekosystemu Expo
- `@react-navigation/native`, `@react-navigation/stack` - Nawigacja i routing w aplikacji
- `axios` - Klient HTTP do komunikacji z backendem API
- `socket.io-client` - Odbiorca i nadawca zdarzeń (WebSockets) od strony klienta
- `@react-native-async-storage/async-storage` - Przechowywanie danych lokalnie na urządzeniu
- `react-native-qrcode-svg`, `react-native-svg` - Generowanie i obsługa grafiki wektorowej (w tym kodów QR)
