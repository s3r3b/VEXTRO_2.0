# VEXTRO - Architektura i Technologie (Stan Aktualny)

VEXTRO to zaawansowany system komunikacji szyfrowanej, bazujący na architekturze klient-serwer z całkowicie "ślepym" węzłem centralnym (Blind Server). Dokument ten opisuje stos technologiczny oraz unikalne mechanizmy wdrożone w systemie.

## 1. Główne Środowisko (Stack Technologiczny)
- **Node.js & Express.js** - Wysokowydajny serwer obsługujący API REST oraz WebSockets.
- **React Native / Expo** - Ekosystem frontendu mobilnego (oraz WebApp poprzez `react-native-web`), pozwalający na współdzielenie kodu kryptograficznego i UI.
- **Socket.io** - Silnik komunikacji czasu rzeczywistego wykorzystywany do routingu wiadomości oraz handshake'u urządzeń.
- **MongoDB / Mongoose** - Baza danych NoSQL przetrzymująca metadane, relacje kontaktów oraz zaszyfrowane pakiety w formacie ślepym.

---

## 2. Architektura Bezpieczeństwa: VEXTRO ShieldEngine

Sercem prywatności VEXTRO jest autorski moduł `ShieldEngine.js`, implementujący pełny algorytm **Double Ratchet** (Podwójnej Zapadni), inspirowany specyfikacją Signal Protocol. Backend nie posiada kluczy i nie jest w stanie odczytać treści wiadomości.

### Komponenty ShieldEngine:
- **Kryptografia Asymetryczna (X25519)**: Wykorzystuje bibliotekę `tweetnacl` (nacl.box) do wymiany kluczy Diffie-Hellman, zapewniając **Post-Compromise Security (PCS)**. Co kilka wiadomości generowana jest nowa para kluczy odświeżająca entropię sesji.
- **Kryptografia Symetryczna (XSalsa20-Poly1305)**: Wykorzystywana do właściwego szyfrowania wiadomości (`nacl.secretbox`) przy użyciu kluczy generowanych z łańcuchów KDF.
- **Algorytmy KDF (HKDF-SHA256)**: Implementacja łańcuchów derywacji kluczy (Root Chain, Sending Chain, Receiving Chain). Każda wiadomość korzysta z jednorazowego klucza (Message Key), zapewniając **Forward Secrecy (FS)**.
- **Mutex (Task Queue)**: Wewnętrzna kolejka asynchroniczna zapobiegająca zjawisku "Race Conditions", gwarantująca spójność liczników wiadomości nawet przy natychmiastowym wysłaniu serii pakietów (ochrona przed desynchronizacją MAC).
- **Pominięte Klucze (Out-of-Order Messages)**: Mechanizm zrzucania nieużytych kluczy (`skippedMessageKeys`) do słownika, pozwalający na prawidłowe odszyfrowanie wiadomości dostarczonych z opóźnieniem przez sieć.

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

**Frontend / Mobile / WebApp:**
- **Expo Core**: `expo`, `expo-av`, `expo-camera`, `expo-crypto`, `expo-secure-store`, `expo-file-system`, `expo-haptics`, `expo-linear-gradient`.
- **Kryptografia**: `tweetnacl` (NACL), własna implementacja `hmacSha256`.
- **UI / Nawigacja**: `@react-navigation/native`, `@react-navigation/stack`, `react-native-svg`, `react-native-qrcode-svg`.
- **Komunikacja**: `axios` (żądania REST), `socket.io-client` (komunikacja real-time).
- **Stan i Cache**: `@react-native-async-storage/async-storage`, LocalStorage (dla WebApp).
