import nacl from 'tweetnacl';
import { Buffer } from 'buffer';
import { hmacSha256 } from './HmacSha256';

/**
 * VEXTRO: SHIELD DOUBLE RATCHET ENGINE
 * 
 * Based on the Signal Protocol (X25519 + HMAC-SHA256 + XSalsa20-Poly1305).
 * Implementation for Forward Secrecy and Post-Compromise Security.
 */

// --- HKDF Primitives ---

/**
 * HKDF-Extract(salt, IKM) -> PRK
 */
async function hkdfExtract(salt, ikm) {
  return await hmacSha256(salt, ikm);
}

/**
 * HKDF-Expand(PRK, info, L) -> OKM
 * L is fixed to multiple of 32 for simplicity (we use it for 32/64 byte keys)
 */
async function hkdfExpand(prk, info, L) {
  const n = Math.ceil(L / 32);
  let okm = new Uint8Array(0);
  let prevT = new Uint8Array(0);

  for (let i = 1; i <= n; i++) {
    const input = new Uint8Array(prevT.length + info.length + 1);
    input.set(prevT, 0);
    input.set(info, prevT.length);
    input.set([i], prevT.length + info.length);

    prevT = await hmacSha256(prk, input);
    const newOkm = new Uint8Array(okm.length + prevT.length);
    newOkm.set(okm, 0);
    newOkm.set(prevT, okm.length);
    okm = newOkm;
  }

  return okm.slice(0, L);
}

// --- KDF Chains ---

/**
 * KDF for Root Chain
 * Returns [New Root Key, New Chain Key]
 */
async function kdfRoot(rk, dhOutput) {
  const info = Buffer.from('VEXTRO_SHIELD_ROOT_KDF', 'utf8');
  const okm = await hkdfExpand(await hkdfExtract(rk, dhOutput), info, 64);
  return [okm.slice(0, 32), okm.slice(32, 64)];
}

/**
 * KDF for Symmetric Chain
 * Returns [Next Chain Key, Message Key]
 */
async function kdfChain(ck) {
  const nextCk = await hmacSha256(ck, new Uint8Array([0x01]));
  const mk = await hmacSha256(ck, new Uint8Array([0x02]));
  return [nextCk, mk];
}

// --- Shield Engine Core ---

export class ShieldSession {
  constructor(state = {}) {
    this.state = {
      rootKey: state.rootKey || null,
      sendingChain: state.sendingChain || null,
      receivingChain: state.receivingChain || null,
      dhKeyPair: state.dhKeyPair || nacl.box.keyPair(),
      remoteDhPublicKey: state.remoteDhPublicKey || null,
      sendingCounter: state.sendingCounter || 0,
      receivingCounter: state.receivingCounter || 0,
      previousCounter: state.previousCounter || 0,
      skippedMessageKeys: state.skippedMessageKeys || {}, // { ratchetId_counter: key }
      ...state
    };
  }

  /**
   * Initialize a new session (handshake)
   */
  static async init(initialRootKey, remotePublicKey) {
    const session = new ShieldSession({
      rootKey: initialRootKey,
      remoteDhPublicKey: remotePublicKey
    });
    
    // Perform initial DH with remote public key
    const dhOut = nacl.box.before(remotePublicKey, session.state.dhKeyPair.secretKey);
    const [newRk, newCk] = await kdfRoot(initialRootKey, dhOut);
    
    session.state.rootKey = newRk;
    session.state.sendingChain = newCk;
    
    return session;
  }

  /**
   * Encrypt a message and advance sending ratchet
   */
  async encrypt(plaintext) {
    const { sendingChain, dhKeyPair, sendingCounter } = this.state;
    
    // Derive message key
    const [nextCk, mk] = await kdfChain(sendingChain);
    this.state.sendingChain = nextCk;
    this.state.sendingCounter++;

    // Prepare Encryption
    const nonce = nacl.randomBytes(24);
    const ciphertext = nacl.secretbox(
      Buffer.from(plaintext, 'utf8'),
      nonce,
      mk
    );

    // Return header (DH key + counters) and ciphertext
    return {
      header: {
        dhPublicKey: Buffer.from(dhKeyPair.publicKey).toString('base64'),
        pn: this.state.previousCounter,
        n: this.state.sendingCounter
      },
      ciphertext: Buffer.from(ciphertext).toString('base64'),
      nonce: Buffer.from(nonce).toString('base64')
    };
  }

  /**
   * Decrypt a message and advance receiving ratchet if needed
   */
  async decrypt(header, ciphertextBase64, nonceBase64) {
    const ciphertext = Buffer.from(ciphertextBase64, 'base64');
    const nonce = Buffer.from(nonceBase64, 'base64');
    const remotePubKey = Buffer.from(header.dhPublicKey, 'base64');

    // 1. Check if it's a new DH ratchet
    const isNewRatchet = !this.state.remoteDhPublicKey || 
                        Buffer.from(this.state.remoteDhPublicKey).toString('hex') !== Buffer.from(remotePubKey).toString('hex');

    if (isNewRatchet) {
      await this.performDhRatchet(remotePubKey);
    }

    // 2. Derive message key (simplified for this POC - usually handles skipping)
    const [nextCk, mk] = await kdfChain(this.state.receivingChain);
    this.state.receivingChain = nextCk;
    this.state.receivingCounter++;

    // 3. Decrypt
    const decrypted = nacl.secretbox.open(ciphertext, nonce, mk);
    if (!decrypted) throw new Error('🛡️ [SHIELD] DECRYPTION_FAILED: MAC mismatch.');

    return Buffer.from(decrypted).toString('utf8');
  }

  async performDhRatchet(remotePubKey) {
    console.log('🛡️ [SHIELD] RATCHET: Rolling Diffie-Hellman entropy...');
    
    this.state.previousCounter = this.state.sendingCounter;
    this.state.sendingCounter = 0;
    this.state.receivingCounter = 0;
    this.state.remoteDhPublicKey = remotePubKey;

    // Receive Ratchet
    const dhOut1 = nacl.box.before(remotePubKey, this.state.dhKeyPair.secretKey);
    const [rk1, ckRc] = await kdfRoot(this.state.rootKey, dhOut1);
    this.state.rootKey = rk1;
    this.state.receivingChain = ckRc;

    // Send Ratchet (New KeyPair)
    this.state.dhKeyPair = nacl.box.keyPair();
    const dhOut2 = nacl.box.before(remotePubKey, this.state.dhKeyPair.secretKey);
    const [rk2, ckSd] = await kdfRoot(this.state.rootKey, dhOut2);
    this.state.rootKey = rk2;
    this.state.sendingChain = ckSd;
  }
}
