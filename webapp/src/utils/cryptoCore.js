import nacl from 'tweetnacl';
import { Buffer } from 'buffer';

export const generateX3DHBundle = () => {
  // 1. Identity Key Pair (Ed25519 do podpisywania)
  const identityKeyPair = nacl.sign.keyPair();
  const identityKeyPubBase64 = Buffer.from(identityKeyPair.publicKey).toString('base64');
  const identityKeyPrivBase64 = Buffer.from(identityKeyPair.secretKey).toString('base64');

  // 2. Signed PreKey Pair (Curve25519 dla Diffie-Hellman)
  const signedPreKeyPair = nacl.box.keyPair();
  const spkBytes = signedPreKeyPair.publicKey;
  const spkBase64 = Buffer.from(spkBytes).toString('base64');
  const spkPrivBase64 = Buffer.from(signedPreKeyPair.secretKey).toString('base64');

  // Podpis klucza publicznego SPK kluczem prywatnym IK (Ed25519)
  const signatureBytes = nacl.sign.detached(spkBytes, identityKeyPair.secretKey);
  const signatureBase64 = Buffer.from(signatureBytes).toString('base64');

  // 3. One-Time PreKeys (Curve25519) - 50 kluczy
  const oneTimePreKeys = [];
  const oneTimePreKeysPrivate = [];
  
  for (let i = 0; i < 50; i++) {
    const opkPair = nacl.box.keyPair();
    const opkPubBase64 = Buffer.from(opkPair.publicKey).toString('base64');
    const opkPrivBase64 = Buffer.from(opkPair.secretKey).toString('base64');
    
    const opkId = `opk-${Date.now()}-${i}`;
    
    oneTimePreKeys.push({ id: opkId, key: opkPubBase64 });
    oneTimePreKeysPrivate.push({ id: opkId, privKey: opkPrivBase64 });
  }

 // Paczka do wysłania na serwer (ZMODYFIKOWANE)
  const bundle = {
    identityKey: identityKeyPubBase64, // Ed25519 (Tylko do autoryzacji/podpisów)
    dhPublicKey: spkBase64,            // NOWE: Curve25519 (Klucz publiczny do wymiany P2P)
    signedPreKey: {
      key: spkBase64,
      signature: signatureBase64
    },
    oneTimePreKeys: oneTimePreKeys
  };

 // Klucze prywatne zatrzymywane na urządzeniu (ZMODYFIKOWANE)
  const localKeys = {
    identityKeyPriv: identityKeyPrivBase64, // Ed25519
    dhPrivKey: spkPrivBase64,               // NOWE: Curve25519 (Do funkcji nacl.box)
    signedPreKeyPriv: spkPrivBase64,
    oneTimePreKeysPriv: oneTimePreKeysPrivate
  };

  return { bundle, localKeys };
};
  export const cryptoCore = {
    generateX3DHBundle,
  };

export default cryptoCore;
