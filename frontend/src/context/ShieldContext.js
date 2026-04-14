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
import StorageManager from '../utils/StorageManager';

const ShieldContext = createContext();

export const ShieldProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [sessions, setSessions] = useState({}); // { contactId: ShieldSession }
  const [groupKeys, setGroupKeys] = useState({}); // { groupId: UInt8Array (Symmetric Key) }
  const [isReady, setIsReady] = useState(false);

  // 2. Load Sessions from storage (UPDATED to use StorageManager version key)
  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('vextro_shield_sessions_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        const restored = {};
        for (const [contactId, state] of Object.entries(parsed)) {
          restored[contactId] = new ShieldSession(state);
        }
        setSessions(restored);
        console.log(`🛡️ [SHIELD] LOADED_${Object.keys(restored).length}_SESSIONS`);
      }
    } catch (e) {
      console.error('🛡️ [SHIELD] SESSION_LOAD_ERROR:', e);
    }
  };

  // 2B. Load Group Keys from storage (NEW)
  const loadGroupKeys = async () => {
    try {
      const stored = await StorageManager.getGroupKeys();
      if (stored) {
        // Restore Uint8Array from base64
        const restored = {};
        for (const [groupId, keyBase64] of Object.entries(stored)) {
          restored[groupId] = Buffer.from(keyBase64, 'base64');
        }
        setGroupKeys(restored);
        console.log(`🛡️ [SHIELD] LOADED_${Object.keys(restored).length}_GROUP_KEYS`);
      }
    } catch (e) {
      console.error('🛡️ [SHIELD] GROUP_KEYS_LOAD_ERROR:', e);
    }
  };

  // 3. Save Sessions to storage (UPDATED to use StorageManager version)
  const saveSessions = async (currentSessions) => {
    try {
      const serialized = {};
      for (const [contactId, session] of Object.entries(currentSessions)) {
        serialized[contactId] = session.state;
      }
      await AsyncStorage.setItem('vextro_shield_sessions_v1', JSON.stringify(serialized));
    } catch (e) {
      console.error('🛡️ [SHIELD] SESSION_SAVE_ERROR:', e);
    }
  };

  // 3B. Save Group Keys to storage (NEW)
  const saveGroupKeys = async (currentGroupKeys) => {
    try {
      // Convert Uint8Array to base64 for storage
      const serialized = {};
      for (const [groupId, key] of Object.entries(currentGroupKeys)) {
        serialized[groupId] = Buffer.from(key).toString('base64');
      }
      await StorageManager.setGroupKeys(serialized);
    } catch (e) {
      console.error('🛡️ [SHIELD] GROUP_KEYS_SAVE_ERROR:', e);
    }
  };

  // 1. Initialize Identity
  useEffect(() => {
    const init = async () => {
      try {
        // FIXED: Use StorageManager instead of deleted SecurityService
        const localKeys = await StorageManager.getX3DHKeys();
        if (localKeys && localKeys.identityKeyPriv) {
          // Identity key exists from previous registration
          const identityPub = await StorageManager.getIdentityPublic();
          setIdentity({ publicKey: identityPub });
          console.log('🛡️ [SHIELD] LOADED_EXISTING_IDENTITY');
        } else {
          // New session: Generate temporary identity (will be replaced on registration)
          const backupPair = nacl.box.keyPair();
          setIdentity({ publicKey: Buffer.from(backupPair.publicKey).toString('base64') });
          console.log('🛡️ [SHIELD] NO_IDENTITY_YET (registration flow)');
        }
      } catch (e) {
        console.error('❌ [SHIELD] CRITICAL_INITIALIZATION_ERROR:', e.message);
      } finally {
        await loadSessions();
        await loadGroupKeys();
        setIsReady(true);
      }
    };
    init();
  }, []);

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
   * UPDATED: Persist group keys to storage
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

    const updated = { ...groupKeys, [groupId]: decryptedKey };
    setGroupKeys(updated);
    await saveGroupKeys(updated); // PERSIST immediately
    console.log(`🛡️ [SHIELD] GROUP_SESSION_SETUP: ${groupId}`);
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
