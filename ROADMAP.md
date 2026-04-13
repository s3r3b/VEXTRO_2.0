# VEXTRO Project Roadmap

## Faza 1 (Backend & E2EE Server Core)
[X] 1.1 Inicjalizacja serwera Express, Socket.io i połączenia z bazą MongoDB
[X] 1.2 Podstawowe modele bazy danych (User, Message, Contact, Group)
[X] 1.3 Podstawowe trasy REST API (Auth, Users, Contacts, Groups, Messages, Media)
[X] 1.4 Komunikacja Real-Time (Socket.io) dla podstawowego przesyłania wiadomości
[X] 1.5 Backend: Implement secure storage and retrieval logic for X3DH PreKey Bundles. Ensure the server acts as a reliable relay for client-side E2EE establishment.
[X] 1.5a Message Relay API Implementation (Zero Knowledge persistence)
[ ] 1.6 Wdrożenie PassKey (WebAuthn/FIDO2)
[ ] 1.7 Production-grade X3DH PreKey Bundle Relay API. This must include endpoints for uploading, replenishing, and fetching bundles (Identity Key, Signed PreKey, and One-Time PreKeys).
[ ] 1.8 Zabezpieczenie endpointu uploadu i autoryzacja pobierania mediów - details in to_be_continued.md
[ ] 1.9 Rozszerzone zarządzanie grupami (rotacja kluczy przy zmianie składu) - details in to_be_continued.md
[ ] 2.0 Implementacja logiki kryptograficznej backendu (utils/crypto.js) - details in to_be_continued.md

## Faza 2 (Frontend Mobile UI & Logic)
[X] 2.1 Konfiguracja nawigacji React Navigation i szkieletu ekranów (Login, Chat, Settings, itp.)
[X] 2.2 Podstawowy interfejs aplikacji (CyberBackground, GlassView, podstawowe przyciski)
[X] 2.3 Nawiązanie połączenia Socket.io z backendem
[ ] 2.4 Wdrożenie rzeczywistej autoryzacji PassKey (WebAuthn/FIDO2)
[ ] 2.5 Pełna implementacja grupowych chatów (tworzenie grup) - details in to_be_continued.md
[ ] 2.6 Zaawansowane funkcje chatu: szukanie, przeglądarka multimediów, skróty - details in to_be_continued.md
[ ] 2.7 Prawdziwy zrzut danych (Intel Dump) i zmiana aliasu w AccountScreen - details in to_be_continued.md
[ ] 2.8 Działający moduł Blacklist w opcjach prywatności - details in to_be_continued.md
[ ] 2.9 Działający moduł AI Neural Net w ChatScreen - details in to_be_continued.md