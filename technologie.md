# VEXTRO - Architektura i Technologie (Stan Aktualny)

VEXTRO to zaawansowany system komunikacji szyfrowanej, bazujący na architekturze klient-serwer z całkowicie "ślepym" węzłem centralnym (Blind Server). Dokument ten opisuje stos technologiczny oraz unikalne mechanizmy wdrożone w systemie.

## 1. Główne Środowisko (Stack Technologiczny)
- **Node.js & Express.js** - Wysokowydajny serwer obsługujący API REST oraz WebSockets.
- **React 19 + Vite** - WebApp frontend (desktop/browser), zbudowany z Vite dev server, zamieniając React Native.
- **Tailwind CSS** - Styling i theming w WebApp.
- **Socket.io** - Silnik komunikacji czasu rzeczywistego wykorzystywany do routingu wiadomości oraz handshake'u urządzeń.
- **MongoDB / Mongoose** - Baza danych NoSQL przetrzymująca metadane, relacje kontaktów oraz zaszyfrowane pakiety w formacie ślepym.

---

## 2. Architektura Bezpieczeństwa Kryptografii

**➡️ PEŁNY OPIS**: `KRYPTOGRAFIA.md` (kompendium + niegotowe rzeczy)

Sercem prywatności VEXTRO: `ShieldEngine.js` (Double Ratchet) + X3DH key exchange. Backend **nie ma kluczy prywatnych**.

**Status**: 70% complete
- ✅ X3DH, OPK consumption, out-of-order messages, DH ratchet
- ⏳ Group message keys, per-message HMAC signatures, per-message DH ratchet

---

## 3. Kluczowe Systemy VEXTRO

### 👻 Ghost Mode (Tryb Ducha)
Mechanizm operujący na warstwie bazy danych (właściwość `isGhost`). Włączenie trybu Ducha przez użytkownika skutkuje:
- Natychmiastowym zniknięciem z globalnej tablicy odkrywania sieci (`/api/users/all`).
- Blokadą możliwości nawiązania nowych połączeń (API zwraca błąd 403 lub 404 dla zapytań o kontakt).
- Uniemożliwieniem namierzenia użytkownika przez wyszukiwarkę po numerze telefonu.

### 🎙️ Anti-Voice Protocol
Zaawansowany moduł konwersji i obsługi notatek głosowych, zintegrowany z interfejsem ChatScreen (korzystający z `expo-av`):
- **Voice-to-Text**: Pozwala nagrać notatkę audio, która jest asynchronicznie przesyłana do silnika na serwerze (`/api/media/transcribe`), konwertowana na tekst i podmieniana w polu wejściowym gotowa do bezpiecznej wysyłki.
- **Voice-to-Voice**: Tradycyjne wysłanie notatki jako zaszyfrowanego bloba danych z dedykowanym interfejsem (fala, czas trwania), ukrywające metadane przed dostawcą sieci.

### 🔗 Premium Web Auth (Scanner Handshake)
Autorski system parowania urządzeń za pomocą Socket.io:
1. WebApp (Terminal) wysyła żądanie `init_web_session` i czeka w odizolowanym pokoju nasłuchując.
2. Urządzenie mobilne wykorzystuje `expo-camera` do zeskanowania kodu QR zawierającego `sessionId` i URL serwera.
3. Mobilny skaner wywołuje `authorize_web_session` przekazując klucze uwierzytelniające, co aktywuje sesję na terminalu. Zapewnia to bezpieczne logowanie bez podawania haseł tekstowych.

### 💻 Admin Shell (God Mode)
Wbudowany terminal administracyjny operujący na `node-pty`. Dostępny wyłącznie dla predefiniowanych numerów (np. Admin +48...). Pozwala na interakcję z powłoką BASH serwera bezpośrednio z przeglądarki poprzez bezpieczny tunel WebSocket.

---

## 4. UI/UX: System VEXTRO Premium Design
Projekt kategorycznie odrzuca generyczne biblioteki komponentów na rzecz autorskich rozwiązań opartych o wytyczne "Future Design":
- **Zaawansowany Glassmorphism**: Komponenty `GlassView` wykorzystujące rozmycie tła, precyzyjne oświetlenie krawędzi (soft lighting) oraz gradienty liniowe (`expo-linear-gradient`).
- **Kinetyka**: Płynne animacje mikrointerakcji dla każdego przycisku czy modalu (obsługiwane natywnymi animacjami React Native lub framer-motion w WebApp).
- **Motywy Środowiskowe**: Obsługa profili wizualnych takich jak `Plasma Core`, `Deep Void`, `Neon Grid`, `Ghost Shell` ze wspólnym zarządzaniem tokenami na poziomie CSS/Tailwind oraz Native.
- **Reakcje Haptyczne**: System `expo-haptics` wspierający każdą ważną operację systemową (np. udane skanowanie QR, blokada kontaktu).

---

## 5. Wykaz Zależności (Zestawienie Pakietów)

**Backend:**
- `express`, `socket.io` - Infrastruktura sieciowa i routing E2EE.
- `mongoose` - ODM dla relacji i obiektów bazy.
- `node-pty` - Generowanie interaktywnych powłok systemowych.
- `cors`, `dotenv` - Bezpieczeństwo i konfiguracja.
- `tweetnacl` - Kryptografia X25519 + nacl.box, używana w ShieldEngine (Double Ratchet).
- `multer` - Upload plików (media: audio, obrazy) do `uploads/`.
- `form-data`, `axios` - Obsługa żądań HTTP z payload'em.
- `crypto-js` - Dodatkowe operacje kryptograficzne.
- `node-bash-title` - Utility dla tytułów procesów.

**WebApp (React 19 + Vite):**
- **Build/Dev**: `vite`, `@vitejs/plugin-react` - Build tool i dev server.
- **Styling**: `tailwindcss` - Utility CSS framework.
- **UI/UX**: `framer-motion` (animacje, transitions), `qrcode.react` (QR code generacja), `lucide-react` (ikony).
- **Routing**: `react-router-dom` - Routing aplikacji (/login, /chat).
- **Kryptografia**: `tweetnacl` (NACL), `buffer` (polyfill), własna implementacja `hmacSha256`.
- **Komunikacja**: `axios` (żądania REST), `socket.io-client` (komunikacja real-time).
- **Stan**: `localStorage` (browser storage).
