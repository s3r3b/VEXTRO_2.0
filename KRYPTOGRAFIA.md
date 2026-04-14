# VEXTRO - Kryptografia & X3DH + Double Ratchet

## 1. X3DH Key Exchange

**Pliki**: cryptoCore.js, backend/routes/keys.js, backend/utils/x3dhVerify.js

Handshake dla inicjalizacji sesji:
- **Identity Key (IK)**: Ed25519 long-term, podpisuje Signed PreKey
- **Signed PreKey (SPK)**: Curve25519, rotowane periodycznie
- **One-Time PreKeys (OPK)**: 50x Curve25519, konsumowane FIFO (`.shift()`)

**Weryfikacja**: `tweetnacl.sign.detached.verify()` na SPK dla ochrony Bundle Poisoning.

**Flow**: Client gen bundle → Upload (atomic register) → Fetch (konsumuj OPK) → ECDH dh1||dh2||dh3||dh4 → Root Key

---

## 2. Double Ratchet - ShieldEngine

**Plik**: webapp/src/utils/ShieldEngine.js

**Klucze**: Root Key → Chain Keys (sending/receiving) → Message Keys

**KDF Chains**:
- `kdfRoot(rk, dhOutput)` → [new RK, new CK] (HKDF-SHA256)
- `kdfChain(ck)` → [nextCK, messageKey] (HMAC-SHA256 counters 0x01/0x02)

**Encryption**: XSalsa20-Poly1305 (`nacl.secretbox`), nonce 24-byte random

**Mutex**: Task queue (_enqueue) zapobiega race conditions na licznikach

**Out-of-Order**: `skippedMessageKeys` dict dla wiadomości dostarczonych nie w kolejności (MAX_SKIP=1000)

**DH Ratchet**: `performDhRatchet()` na zmianę DH keya (nie na każdą msg)

---

## 3. Storage

**Frontend** (`localStorage`):
- `vextro_x3dh_local_keys` - IK/SPK/OPK private (NIGDY nie wysyłane)
- `vextro_shield_sessions` - ShieldSession state per contact
- `vextro_identity_public` - Public key

**Backend** (MongoDB User):
- `publicKey` - Identity Key
- `signedPreKey` - {key, signature, createdAt}
- `oneTimePreKeys` - [{id, key}, ...] (max 100)

---

## 4. Security Properties

| Property | Status | Note |
|----------|--------|------|
| Forward Secrecy (FS) | ✅ Full | Message keys ephemeral |
| Post-Compromise Security (PCS) | ✅ Partial | DH ratchet on key change, not per-msg |
| Replay Protection | ✅ Full | Counters + out-of-order |
| Bundle Poisoning | ✅ Full | Ed25519 signature verify |
| DoS Storage | ✅ Full | Max 100 OPK |
| Per-Message Auth | ❌ None | Only AEAD (MAC from encryption) |
| Quantum Safe | ❌ No | No PQC (future: Kyber) |

---

## 5. 🚨 NIEGOTOWE / INCOMPLETE

### Critical
- [ ] **Group Message Keys** - setupGroupSession/encryptForGroup/decryptFromGroup w ShieldContext.jsx, ale BRAK backend routes
- [ ] **Per-Message HMAC Signature** - Brak per-message authentication (tylko AEAD)
- [ ] **DH Ratchet Every Message** - Currently only on DH key change, not full per-message ratchet (Signal spec)

### Important
- [ ] **Session Persistence Validation** - localStorage sessions nie weryfikują czy są valid na każdej inicjalizacji
- [ ] **localStorage Versioning** - Duplicate key errors on fresh registration (brak reset)
- [ ] **Sender Identity Hiding** - No per-message sender signature (anonimowość, ale brak authentication)

### Partial
- [x] OPK Consumption - ✅ FIFO implemented (.shift() + markModified)
- [x] Out-of-Order Messages - ✅ Implemented (skippedMessageKeys)
- [x] DH Ratchet (Receive/Send) - ✅ Implemented (performDhRatchet), but not per-msg

---

## 6. Plik Manifest

| File | Purpose |
|------|---------|
| webapp/src/utils/cryptoCore.js | X3DH bundle gen |
| webapp/src/utils/ShieldEngine.js | Double Ratchet encrypt/decrypt |
| webapp/src/utils/HmacSha256.js | HMAC-SHA256 (WebCrypto) |
| webapp/src/context/ShieldContext.jsx | Session management + **GROUP KEYS (TODO)** |
| backend/routes/keys.js | X3DH upload/fetch, OPK consumption |
| backend/utils/x3dhVerify.js | Ed25519 signature verify |
| backend/models/User.js | X3DH schema |

---

**Last Updated**: 2026-04-14  
**Version**: 1.1.0 (incomplete: groups, per-msg auth)  
**Implementation**: 70% complete (core X3DH + Double Ratchet done, niche features TODO)
