// /workspaces/VEXTRO/webapp/src/utils/HmacSha256.js
/**
 * VEXTRO: SHIELD HMAC ENGINE (WEB EDITION)
 * 
 * High-performance HMAC-SHA256 implementation leveraging 
 * browser's native Web Crypto API.
 */

export async function hmacSha256(key, message) {
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', 
    key, 
    { name: 'HMAC', hash: 'SHA-256' }, 
    false, 
    ['sign']
  );
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
}
