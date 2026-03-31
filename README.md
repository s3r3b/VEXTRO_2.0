🛡️ VEXTRO | Encrypted E2EE Messenger

    Status: Development Phase (Antigravity Mode Activated 🚀)

    Security Architecture: Zero-Knowledge / Device-Bound Authentication

VEXTRO is a minimalist, ultra-secure communication platform designed for users who prioritize absolute privacy. Built with a Node.js backend and React Native frontend, it follows a "Blind Server" philosophy—the server never sees, hears, or stores your private data in an unencrypted state.
💎 Key Features
👻 Ghost Mode (The Nuclear Option)

A unique system for temporary, self-destructing chat rooms.

    One-Tap Activation: Create isolated, ephemeral channels via a dedicated UI toggle.

    Logic: The last person to leave the room triggers a server-side wipe.

    Zero Trace: All messages and metadata are permanently purged from the MongoDB Atlas cluster. No logs, no remnants.

🎙️ Advanced Hybrid Voice Chat

Full control over your vocal privacy:

    Audio Mode: Send high-fidelity, end-to-end encrypted voice messages.

    Speech-to-Text (STT): Convert voice to text locally before transmission to maintain silence and anonymity in sensitive environments.

🔐 Zero-Trust Security Framework

    No Passwords, No Emails: Authentication is tied to a unique deviceId and a Public/Private key pair generated on the first launch.

    Hybrid Encryption: Currently utilizing a SecurityService.js cryptographic bridge.

    Argon2 Readiness: Logic is prepared for full Argon2/Libsodium integration once transitioned to a Development Build (Post-Expo Go).

🛠️ Tech Stack

    Frontend: React Native (Expo Go / Dev Client)

    Backend: Node.js + Express

    Real-time: Socket.io (Ultra-low latency event handling)

    Database: MongoDB Atlas (Mongoose ODM)

    AI Core: Optimized via Google AI Pro (Antigravity Engine)

    Design System: Custom "Matte Black & Neon Violet" Theme


🚀 Roadmap

    [x] Phase 1: Core UI & Matte/Neon Design implementation.

    [x] Phase 2: Socket.io integration and real-time message flow.

    [ ] Phase 3: Full Argon2 implementation in Production/Dev Build.

    [ ] Phase 4: Ghost Mode TTL (Time-To-Live) automated logic.

    [ ] Phase 5: Enhanced audio filtering for Voice Chat.

⚡ Quick Start

    Backend:
    Bash

    cd backend
    npm install
    node server.js

    Frontend:
    Bash

    cd frontend
    npx expo install
    npx expo start

    Note: The VEXTRO project was developed for educational and research purposes regarding data privacy in decentralized networks.
