// /workspaces/VEXTRO/frontend/src/context/ShieldContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';

// Podpięcie natywnego generatora liczb losowych Expo pod silnik tweetnacl
nacl.setPRNG((x, n) => {
  const randomBytes = Crypto.getRandomBytes(n);
  for (let i = 0; i < n; i++) {
    x[i] = randomBytes[i];
  }
});

import { Buffer } from 'buffer';
import { ShieldSession } from '../utils/ShieldEngine';

const ShieldContext = createContext();

export const ShieldProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [sessions, setSessions] = useState({}); // { contactId: ShieldSession }
  const [groupKeys, setGroupKeys] = useState({}); // { groupId: UInt8Array (Symmetric Key) }
  const [isReady, setIsReady] = useState(false);

  // 1. Initialize Identity
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🛡️ [SHIELD] STARTING_INITIALIZATION...');
        
        // Timeout dla SecureStore (często się zawiesza w containerach)
        const storageTask = Promise.all([
          SecureStore.getItemAsync('vextro_identity_public'),
          SecureStore.getItemAsync('vextro_identity_private')
        ]);

        const timeoutTask = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("STORAGE_TIMEOUT")), 4000)
        );

        let keys;
        try {
          keys = await Promise.race([storageTask, timeoutTask]);
        } catch (e) {
          console.warn('⚠️ [SHIELD] SECURE_STORE_TIMEOUT or ERROR. Using volatile identity.');
          keys = [null, null];
        }

        let [pubKey, privKey] = keys;

        if (!pubKey || !privKey) {
          console.log('🛡️ [SHIELD] GENERATING_IDENTITY: Industrial-grade keys...');
          const keyPair = nacl.box.keyPair();
          pubKey = Buffer.from(keyPair.publicKey).toString('base64');
          privKey = Buffer.from(keyPair.secretKey).toString('base64');

          try {
            await SecureStore.setItemAsync('vextro_identity_public', pubKey);
            await SecureStore.setItemAsync('vextro_identity_private', privKey, {
              keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            });
          } catch (storageErr) {
            console.error('❌ [SHIELD] SECURE_STORE_WRITE_ERROR:', storageErr.message);
          }
        }

        console.log('🛡️ [SHIELD] IDENTITY_READY:', pubKey.substring(0, 10) + '...');
        setIdentity({ publicKey: pubKey });
        await loadSessions();
        setIsReady(true);
      } catch (criticalErr) {
        console.error('❌ [SHIELD] CRITICAL_INITIALIZATION_ERROR:', criticalErr.message);
        // Fail-safe: Nawet jeśli wszystko padnie, pozwólmy na start z pustą tożsamością RAM
        const backupPair = nacl.box.keyPair();
        setIdentity({ publicKey: Buffer.from(backupPair.publicKey).toString('base64') });
        setIsReady(true);
      }
    };
    init();
  }, []);

  // 2. Load Sessions from storage
  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('vextro_shield_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        const restored = {};
        for (const [contactId, state] of Object.entries(parsed)) {
          restored[contactId] = new ShieldSession(state);
        }
        setSessions(restored);
      }
    } catch (e) {
      console.error('🛡️ [SHIELD] SESSION_LOAD_ERROR:', e);
    }
  };

  // 3. Save Sessions to storage
  const saveSessions = async (currentSessions) => {
    try {
      const serialized = {};
      for (const [contactId, session] of Object.entries(currentSessions)) {
        serialized[contactId] = session.state;
      }
      await AsyncStorage.setItem('vextro_shield_sessions', JSON.stringify(serialized));
    } catch (e) {
      console.error('🛡️ [SHIELD] SESSION_SAVE_ERROR:', e);
    }
  };

  /**
   * Start a new E2EE session with a contact
   */
  const startSession = async (contactId, remotePublicKey, initialRootKey) => {
    console.log(`🛡️ [SHIELD] STARTING_SESSION: User <${contactId}>`);
    const session = await ShieldSession.init(initialRootKey, Buffer.from(remotePublicKey, 'base64'));
    
    const newSessions = { ...sessions, [contactId]: session };
    setSessions(newSessions);
    await saveSessions(newSessions);
  };

  /**
   * Securely encrypt a message for a specific contact
   */
  const encryptFor = async (contactId, plaintext) => {
    const session = sessions[contactId];
    if (!session) throw new Error(`🛡️ [SHIELD] NO_SESSION for ${contactId}`);

    const result = await session.encrypt(plaintext);
    await saveSessions(sessions); // Save state after ratchet progression
    return result;
  };

  /**
   * Decrypt an incoming message
   */
  const decryptFrom = async (contactId, header, ciphertext, nonce) => {
    const session = sessions[contactId];
    if (!session) throw new Error(`🛡️ [SHIELD] NO_SESSION for ${contactId}`);

    const plaintext = await session.decrypt(header, ciphertext, nonce);
    await saveSessions(sessions); // Save state after ratchet progression
    return plaintext;
  };

  /**
   * [GROUP] Generates a 32-byte symmetric key and envelopes it for each member using nacl.box
   */
  const generateGroupKeyAndEnvelopes = async (membersList) => {
    // Generowanie głównego symetrycznego klucza AES/Poly1305 dla Pokoju Miejscowego (32 bajty)
    const groupSecretKey = nacl.randomBytes(32);
    const myPrivKeyRaw = await SecureStore.getItemAsync('vextro_identity_private');
    const myPrivKey = Buffer.from(myPrivKeyRaw, 'base64');
    
    const envelopes = membersList.map(member => {
      const remotePubKey = Buffer.from(member.publicKey, 'base64');
      const nonce = nacl.randomBytes(24);
      // Szyfrowanie symetrycznego klucza kluczem publicznym danego członka
      const encrypted = nacl.box(groupSecretKey, nonce, remotePubKey, myPrivKey);
      
      return {
        phone: member.phone,
        encryptedKey: Buffer.from(encrypted).toString('base64'),
        nonce: Buffer.from(nonce).toString('base64')
      };
    });

    return { groupSecretKey, envelopes };
  };

  /**
   * [GROUP] Setup a group channel from the envelope received from the backend
   */
  const setupGroupSession = async (groupId, encryptedKeyRaw, nonceRaw, adminPublicKeyRaw) => {
    const myPrivKeyRaw = await SecureStore.getItemAsync('vextro_identity_private');
    const myPrivKey = Buffer.from(myPrivKeyRaw, 'base64');
    const adminPubKey = Buffer.from(adminPublicKeyRaw, 'base64');
    
    // Odszyfrowywanie "koperty" asymetrycznej
    const decryptedKey = nacl.box.open(
      Buffer.from(encryptedKeyRaw, 'base64'),
      Buffer.from(nonceRaw, 'base64'),
      adminPubKey,
      myPrivKey
    );

    if (!decryptedKey) throw new Error("🛡️ [SHIELD] Pudełko klucza grupowego naruszone!");
    
    setGroupKeys(prev => ({ ...prev, [groupId]: decryptedKey }));
  };

  /**
   * [GROUP] Symmetrical Group Encryption using nacl.secretbox
   */
  const encryptForGroup = (groupId, plaintext) => {
    const key = groupKeys[groupId];
    if (!key) throw new Error("🛡️ [SHIELD] Brak dekodera Grupy.");

    const nonce = nacl.randomBytes(24);
    const messageUint8 = Buffer.from(plaintext, 'utf8');
    const encrypted = nacl.secretbox(messageUint8, nonce, key);

    return {
      ciphertext: Buffer.from(encrypted).toString('base64'),
      nonce: Buffer.from(nonce).toString('base64')
    };
  };

  /**
   * [GROUP] Symmetrical Group Decryption
   */
  const decryptFromGroup = (groupId, ciphertextRaw, nonceRaw) => {
    const key = groupKeys[groupId];
    if (!key) throw new Error("🛡️ [SHIELD] Brak dekodera Grupy.");

    const decrypted = nacl.secretbox.open(
      Buffer.from(ciphertextRaw, 'base64'),
      Buffer.from(nonceRaw, 'base64'),
      key
    );

    if (!decrypted) throw new Error("🛡️ [SHIELD] Grupowy pakiet uszkodzony.");
    return Buffer.from(decrypted).toString('utf8');
  };

  const value = {
    identity,
    sessions,
    groupKeys,
    startSession,
    encryptFor,
    decryptFrom,
    generateGroupKeyAndEnvelopes,
    setupGroupSession,
    encryptForGroup,
    decryptFromGroup,
    isReady
  };

  return (
    <ShieldContext.Provider value={value}>
      {children}
    </ShieldContext.Provider>
  );
};

export const useShield = () => {
  const context = useContext(ShieldContext);
  if (!context) throw new Error('useShield must be used within ShieldProvider');
  return context;
};
