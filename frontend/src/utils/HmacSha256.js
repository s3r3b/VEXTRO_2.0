// /workspaces/VEXTRO/frontend/src/utils/HmacSha256.js
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';

/**
 * VEXTRO: SHIELD HMAC ENGINE
 * 
 * High-performance HMAC-SHA256 implementation leveraging expo-crypto's 
 * native hashing where possible.
 */

const BLOCK_SIZE = 64; // SHA-256 block size

/**
 * HMAC-SHA256 Calculation
 * @param {Uint8Array} key 
 * @param {Uint8Array} message 
 * @returns {Promise<Uint8Array>} 32-byte HMAC
 */
export async function hmacSha256(key, message) {
  let hmacKey = key;

  // 1. If key is longer than block size, hash it
  if (hmacKey.length > BLOCK_SIZE) {
    const hashedKeyHex = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Buffer.from(hmacKey).toString('hex'),
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    hmacKey = Buffer.from(hashedKeyHex, 'hex');
  }

  // 2. If key is shorter than block size, pad it with zeros
  if (hmacKey.length < BLOCK_SIZE) {
    const paddedKey = new Uint8Array(BLOCK_SIZE);
    paddedKey.set(hmacKey);
    hmacKey = paddedKey;
  }

  // 3. Prepare pads
  const oPad = new Uint8Array(BLOCK_SIZE);
  const iPad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    oPad[i] = hmacKey[i] ^ 0x5c;
    iPad[i] = hmacKey[i] ^ 0x36;
  }

  // 4. Inner hash: H((K ^ ipad) || message)
  const innerMsg = new Uint8Array(BLOCK_SIZE + message.length);
  innerMsg.set(iPad, 0);
  innerMsg.set(message, BLOCK_SIZE);

  const innerHashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Buffer.from(innerMsg).toString('hex'),
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  const innerHash = Buffer.from(innerHashHex, 'hex');

  // 5. Outer hash: H((K ^ opad) || innerHash)
  const outerMsg = new Uint8Array(BLOCK_SIZE + innerHash.length);
  outerMsg.set(oPad, 0);
  outerMsg.set(innerHash, BLOCK_SIZE);

  const outerHashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Buffer.from(outerMsg).toString('hex'),
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  return new Uint8Array(Buffer.from(outerHashHex, 'hex'));
}
