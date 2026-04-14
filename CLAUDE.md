# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Quick Start

**Project:** VEXTRO – E2E Encrypted Messaging (React/Node.js/MongoDB/Socket.io)  
**Status:** 🚨 In critical recovery mode – See `/workspaces/VEXTRO/surgery_mode.md` for full diagnosis and repair plan  
**Development Environment:** Windows 10 → Docker Dev Container → Linux  
- Frontend: http://localhost:5173 (Vite React)
- Backend: http://localhost:5050 (Express/Node)
- Database: MongoDB (MONGO_URI in .env)

**Key Architectural Decision:** X3DH key exchange for end-to-end encryption. Protocol is partially implemented. See surgery_mode.md for missing pieces.

---

## How to Run

### Backend
```bash
cd /workspaces/VEXTRO/backend
npm install
npm start  # or node server.js
```
Backend will listen on port 5050. Requires `.env` file with `MONGO_URI`.

### Frontend (Vite)
```bash
cd /workspaces/VEXTRO/webapp
npm install
npm run dev
```
Frontend will start on port 5173 with hot reload. Vite proxy is configured but currently bypassed in favor of direct `localhost:5050` connections via `NetworkConfig.js`.

### Database
MongoDB connection string must be in `.env`:
```
MONGO_URI=mongodb+srv://...
```

---

## Critical Architecture Decisions

### 1. X3DH Key Exchange (Signal Protocol subset)
- **Why:** End-to-end encryption requires establishing shared keys between two agents without a shared secret beforehand
- **How:** 
  - Client generates Identity Key (long-term) + Signed Pre-Key (rotational) + One-Time Pre-Keys
  - Client sends these during registration (POST /api/auth/register)
  - Server stores all keys in MongoDB User document
  - When initiating secure session, client fetches receiver's keys and performs ECDH calculations
  - Result: Single Initial Root Key for conversation
- **Status:** Bundle generation works (cryptoCore.js), but OPK consumption not implemented. See Faza 6.2 in surgery_mode.md.

### 2. Storage Strategy (localStorage vs Server State)
- **Identity Keys (private):** Stored in browser localStorage under `vextro_x3dh_local_keys` – LOCAL ONLY, never sent to server
- **Public Keys:** Stored in MongoDB User document – server holds what's needed to initiate sessions with this user
- **Session State:** Socket.io sessions managed by server-side SessionStore (see utils/SessionStore.js)
- **Problem:** localStorage is unversioned and not cleared on new registrations → duplicate key errors. See Faza 3.2 in surgery_mode.md.

### 3. Network Layer (Frontend ↔ Backend)
- **Configuration:** `NetworkConfig.js` returns `${hostname}:5050/api` for all API calls
- **Current Limitation:** Assumes backend is accessible on same host at port 5050 – fragile on Windows + Docker
- **CORS:** Enabled with `origin: "*"` (unsafe but works in dev)
- **No Auth Headers:** requests don't include Authorization tokens yet
- **Problem:** See Faza 4 in surgery_mode.md for improvements.

### 4. Socket.io Usage (Real-Time Messaging)
- **Purpose:** QR-based authentication + live message streaming
- **Flow:**
  1. Web app creates Socket connection to backend
  2. Emits `init_web_session` → backend generates sessionId
  3. Desktop app scans QR → emits `authorize_web_session` → backend broadcasts to web socket
  4. Web receives `web_session_authorized` → fetches user keys from HTTP API
  5. Finally: navigate to /chat
- **Problem:** Session lifecycle is tangled, socket reconnects on every component mount. See Faza 5 in surgery_mode.md.

---

## File Structure Overview

```
/workspaces/VEXTRO/
├── backend/
│   ├── server.js                    # Express app + Socket.io setup
│   ├── routes/
│   │   ├── auth.js                  # POST /register, POST /login (ATOMIC now)
│   │   ├── keys.js                  # ❓ UNKNOWN – should have /upload, /fetch, /rotate
│   │   ├── messages.js              # POST /send, GET /retrieve
│   │   ├── users.js                 # ❓ UNKNOWN
│   │   ├── contacts.js              # ❓ UNKNOWN
│   │   └── groups.js                # ❓ UNKNOWN
│   ├── models/
│   │   ├── User.js                  # phoneNumber, publicKey, signedPreKey, oneTimePreKeys (X3DH schema)
│   │   ├── Message.js               # senderPhone, receiverPhone, encryptedPayload, createdAt
│   │   ├── Contact.js               # (inferred)
│   │   └── Group.js                 # (inferred)
│   ├── utils/
│   │   └── SessionStore.js          # ❓ UNKNOWN – manages web session state
│   └── .env                         # MONGO_URI required
│
├── webapp/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginScreen.jsx       # Registration/Login UI + X3DH bundle generation
│   │   │   └── ChatScreen.jsx        # Message view (post-login)
│   │   ├── components/ui/
│   │   │   ├── PhoneAuthPanel.jsx    # Phone input + PIN entry
│   │   │   └── QrPanel.jsx           # QR code display for desktop sync
│   │   ├── context/
│   │   │   └── ShieldContext.jsx     # ❓ UNKNOWN – likely identity state management
│   │   ├── services/
│   │   │   ├── NetworkConfig.js      # getSocketUrl(), getApiBase() – HARDCODED localhost:5050
│   │   │   └── apiService.js         # HTTP wrapper (uploadKeys, fetchReceiverKeys, sendMessage, ...)
│   │   └── utils/
│   │       └── cryptoCore.js         # ❓ UNKNOWN – generateX3DHBundle() source
│   └── vite.config.js               # Build config
│
├── frontend/ (legacy?)
│   └── src/services/
│       ├── apiService.js            # ⚠️ DUPLICATE of webapp version?
│       └── cryptoCore.js            # ⚠️ DUPLICATE?
│
├── surgery_mode.md                  # 📋 FULL DIAGNOSIS + REPAIR PLAN (READ THIS FIRST)
├── MESSAGE_RELAY_STEPS.md           # Checklist for message API (legacy?)
├── API_IMPLEMENTATION_STEPS.md      # Deleted (git: D mark)
├── ROADMAP.md                       # Project status/todos
└── to_be_continued.md               # (unclear)
```

**Critical BLIND SPOTS (files not fully analyzed):**
- routes/keys.js – expected to exist but never read
- utils/SessionStore.js – referenced but never read
- context/ShieldContext.jsx – referenced but never read
- utils/cryptoCore.js – referenced but never read
- routes/users.js, contacts.js, groups.js – mounted but never read
- frontend/ vs webapp/ – unclear which is current

---

## Debugging Guide

### 1. localStorage Corruption (Most Common)
**Symptom:** "Duplicate key error" (409) or "User not found" (404) after registration  
**Root Cause:** Old keys lingering in browser storage from previous sessions  
**Fix:**
```javascript
// In browser console:
localStorage.clear();
location.reload();
```
Then retry registration.

### 2. Backend Connection Fails (Network Config)
**Symptom:** Cannot fetch keys, CORS errors, WebSocket closed before connection  
**Root Cause:** Frontend trying to reach `localhost:5050` but backend not accessible (Docker bridge network issue)  
**Debug:**
```bash
# From inside Docker container:
curl http://localhost:5050/
# Should return: VEXTRO Backend is Online

# From Windows host:
curl http://host.docker.internal:5050/
# If this fails, backend is not exposed correctly
```

### 3. Registration Race Condition (Async Issues)
**Symptom:** 201 response on /register but then 404 when fetching keys  
**Root Cause:** Frontend sends async POST /register then POST /keys/upload, but second request fails after server timeout  
**Debug:**
```javascript
// In LoginScreen.jsx, add console logs around axios.post:
console.log("1. Sending registration...");
await axios.post(...register);
console.log("2. Registration done. Sending keys...");
await apiService.uploadKeys(...);
console.log("3. Keys sent successfully");
```
Check if all 3 logs appear, or if execution stops at #2.

### 4. Socket.io Connection Issues
**Symptom:** "WebSocket is closed before the connection is established"  
**Root Cause:** Backend not listening on correct port or frontend using wrong URL  
**Debug:**
```javascript
// In LoginScreen.jsx:
const socket = io(NetworkConfig.getSocketUrl(), { 
  transports: ['websocket'],
});
console.log("Attempting connection to:", NetworkConfig.getSocketUrl());
socket.on('connect', () => console.log("✓ Connected"));
socket.on('connect_error', (err) => console.error("✗ Error:", err));
```

### 5. Database Errors (Duplicate Key, Validation)
**Symptom:** MongoDB error 11000 or validation errors  
**Debug:**
```bash
# In MongoDB shell/Compass:
db.users.find({})
# Look for users with duplicate phoneNumber or publicKey

# Reset for testing:
db.users.deleteMany({})
db.messages.deleteMany({})
```

---

## Important Implementation Notes

### DO:
✅ Read surgery_mode.md FIRST before making ANY changes  
✅ Check which files are unknown (❓) – ask Claude to read them  
✅ Test registration → keys fetch → message flow end-to-end  
✅ Use `console.log()` liberally – debugging async flows is critical  
✅ Verify MongoDB data after each phase  

### DO NOT:
❌ Implement Double Ratchet before fixing registration (wrong priority)  
❌ Assume NetworkConfig.js works on Windows – test it  
❌ Merge to main without testing error scenarios  
❌ Store private keys on server (Identity Key stays local only)  
❌ Use old code from `/frontend/` folder without verifying it's not duplicate  

---

## Key Gotchas Specific to This Project

1. **localStorage versioning:** No way to tell if stored keys are from old sessions. Symptom: Duplicate key errors.
2. **Two identical service files:** `/webapp/src/services/` and `/frontend/src/services/` have duplicate names. Unclear which is active.
3. **Unknown dependencies:** SessionStore.js, cryptoCore.js, ShieldContext.jsx are critical but never fully analyzed.
4. **X3DH incomplete:** Bundle generation exists but OTPK consumption missing → potential key reuse vulnerabilities.
5. **Socket.io session state:** Session lifecycle is hard to follow, socket reconnects on every mount.
6. **Async Error Propagation:** React 18+ requires explicit error boundaries, promises must be returned or awaited.

---

## When You Get Stuck

1. **Look at surgery_mode.md** – It has the full diagnosis and prioritized fix plan
2. **Check the Faze/Step number** in surgery_mode.md that applies to your task
3. **Read the unknown files** – Files marked with ❓ need to be read first
4. **Test end-to-end** – Registration → Login → Send message → Receive message
5. **Check console logs** – Backend and frontend logs tell the real story
6. **Use Postman/curl** – Test API endpoints in isolation before fixing React

---

**Last Updated:** 2026-04-13  
**Surgery Mode Status:** 🚨 CRITICAL – Full diagnosis in surgery_mode.md  
**Next Session Should Start With:** Read surgery_mode.md + identify unknown files
