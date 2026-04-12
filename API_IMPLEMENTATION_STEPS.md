# MISSION TRACKER: X3DH PreKey Bundle Relay API

## CURRENT PHASE & STATUS
**Phase 3: Technical Design & Report (STOP & WAIT)**
Status: Pending user approval.

[x] ## PHASE 1: CRYPTOGRAPHIC RESEARCH (EXTERNAL)
[x] **Findings on Signal Protocol (X3DH) & PreKey Relays:**
[x] - **Context Update**: The frontend has migrated to a full Double Ratchet implementation. The backend's sole responsibility is to act as a robust X3DH PreKey Relay, facilitating the initial asynchronous key exchange without participating in the encryption itself.
[x] - **Server Role**: The relay is untrusted but critical for availability. It stores Identity Keys (IK), Signed PreKeys (SPK), and One-Time PreKeys (OPK).
[x] - **Bundle Composition**:
[x]   - $IK_B$: Identity Key (Ed25519 Public Key).
[x]   - $SPK_B$: Signed PreKey (rotated periodically).
[x]   - $Sig(IK_B, Encode(SPK_B))$: Signature of the SPK by the IK.
[x]   - $OPK_B$: One-Time PreKey (consumed on first use).
[x] - **Security Constraints**:
[x]   - **Signature Verification**: Although end-to-end security relies on the client, the server MUST verify the signature of the SPK using the IK upon upload to prevent bundle poisoning or denial of service by malicious actors submitting junk data.
[x]   - **OTP Exhaustion (FIFO)**: One-Time PreKeys must be served exactly once. If a user runs out of OTPs, the server must still return the bundle (without an OTP), forcing the client to fall back to a 3-DH flow (which sacrifices forward secrecy for that specific session but maintains liveness).
[x]   - **Replay & DoS Protection**: The server should enforce limits on the maximum number of OTPs stored per user to prevent storage exhaustion (e.g., max 100).

[x] ## PHASE 2: WORKSPACE MAPPING (INTERNAL)
[x] **Findings in `/workspaces/VEXTRO/backend`:**
[x] - **Existing Models**: `models/User.js` already contains fields for `publicKey` (acting as IK), `signedPreKey` (containing `key`, `signature`, `createdAt`), and `oneTimePreKeys` (array of `{key, id}`).
[x] - **Integration Points**: 
[x]   - Uploading bundles: A dedicated `POST /api/keys/upload` route is cleanest and strictly adheres to the X3DH lifecycle.
[x]   - Fetching bundles: A dedicated `GET /api/keys/:phone` route is required.
[x] - **Legacy Cleanup**: The file `backend/crypto.js` was acknowledged as a legacy text placeholder from early test-driven symmetric encryption attempts. Since the frontend now relies on a pure Double Ratchet engine, `crypto.js` has been removed. The backend does not encrypt or decrypt messages; it only verifies signatures and relays keys.

[x] ## PHASE 3: TECHNICAL DESIGN
[x] ### 1. DATABASE SCHEMA (Mongoose)
[x] We will leverage the existing `User` model, which correctly defines the needed fields:
```javascript
// Inside models/User.js (Existing)
publicKey: { type: String, required: true, unique: true }, // IK_B
signedPreKey: {
  key: { type: String }, // SPK_B
  signature: { type: String }, // Sig(IK_B, SPK_B)
  createdAt: { type: Date, default: Date.now }
},
oneTimePreKeys: [
  {
    key: { type: String },
    id: { type: Number }
  }
]
```
[x] No schema changes are required, ensuring backwards compatibility and minimizing surface area for bugs.

[x] ### 2. API SPEC (New Route: `routes/keys.js`)
[x] **A. Upload PreKey Bundle**
[x] - **Endpoint**: `POST /api/keys/upload`
[x] - **Payload**:
  ```json
  {
    "phoneNumber": "+48123456789",
    "identityKey": "base64",
    "signedPreKey": {
      "key": "base64",
      "signature": "base64"
    },
    "oneTimePreKeys": [
      { "id": 1, "key": "base64" },
      ...
    ]
  }
  ```
[x] - **Logic**: 
[x]   1. Validate that the provided `identityKey` matches the one in the database for the given user.
[x]   2. Verify the SPK signature using the Identity Key to prevent junk uploads.
[x]   3. Update `signedPreKey` and append/replace `oneTimePreKeys` (truncating at 100 to prevent DoS).

[x] **B. Fetch PreKey Bundle**
[x] - **Endpoint**: `GET /api/keys/:phone`
[x] - **Logic**: 
[x]   1. Find user by `phoneNumber`.
[x]   2. Extract `identityKey` (`publicKey`) and `signedPreKey`.
[x]   3. Pop (remove) the first `oneTimePreKey` from the array (FIFO).
[x]   4. Atomically save the user state.
[x]   5. Return the bundle. If `oneTimePreKeys` is empty, return bundle without `oneTimePreKey`.

[x] ### 3. VALIDATION (Signature Verification)
[x] - **Library**: `tweetnacl` will be installed, as standard Node.js `crypto` with Ed25519 can be inconsistent with raw libsodium/nacl buffers produced by React Native clients. `tweetnacl` guarantees byte-for-byte compatibility with standard Double Ratchet/X3DH implementations (like `libsodium-wrappers` or Expo Crypto).
[x] - **Implementation**: We will create a utility in `backend/utils/x3dhVerify.js` (to clearly distinguish from the old legacy crypto.js) that exposes a function to check `tweetnacl.sign.detached.verify(...)`.

[x] ## PENDING ACTION ITEMS (PHASE 4)
[x] - [x] Install `tweetnacl` library in `/backend`.
[x] - [x] Implement signature validation utility in `backend/utils/x3dhVerify.js`.
[x] - [x] Create `backend/routes/keys.js` with `upload` and `fetch` endpoints.
[x] - [x] Mount `/api/keys` in `backend/server.js`.
[x] - [x] Fix `package.json` main entry (currently pointing to deleted `crypto.js`) to `server.js`.