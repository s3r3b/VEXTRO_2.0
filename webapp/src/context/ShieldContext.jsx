import React, { createContext, useState, useContext, useEffect } from 'react';
import nacl from 'tweetnacl';
import { Buffer } from 'buffer';
import { ShieldSession } from '../utils/ShieldEngine';

const ShieldContext = createContext();

export const ShieldProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [sessions, setSessions] = useState({}); // { contactId: ShieldSession }
  const [groupKeys, setGroupKeys] = useState({}); // { groupId: UInt8Array }
  const [isReady, setIsReady] = useState(false);

  // 1. Initialize Identity
  useEffect(() => {
    const init = async () => {
      let pubKey = localStorage.getItem('vextro_identity_public');
      let privKey = localStorage.getItem('vextro_identity_private');

      if (!pubKey || !privKey) {
        console.log('🛡️ [SHIELD WEB] GENERATING_IDENTITY: Industrial-grade keys...');
        const keyPair = nacl.box.keyPair();
        pubKey = Buffer.from(keyPair.publicKey).toString('base64');
        privKey = Buffer.from(keyPair.secretKey).toString('base64');

        localStorage.setItem('vextro_identity_public', pubKey);
        localStorage.setItem('vextro_identity_private', privKey);
      }

      setIdentity({ publicKey: pubKey });
      loadSessions();
      setIsReady(true);
    };
    init();
  }, []);

  // 2. Load Sessions from storage
  const loadSessions = () => {
    try {
      const stored = localStorage.getItem('vextro_shield_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        const restored = {};
        for (const [contactId, state] of Object.entries(parsed)) {
          restored[contactId] = new ShieldSession(state);
        }
        setSessions(restored);
      }
    } catch (e) {
      console.error('🛡️ [SHIELD WEB] SESSION_LOAD_ERROR:', e);
    }
  };

  // 3. Save Sessions to storage
  const saveSessions = (currentSessions) => {
    try {
      const serialized = {};
      for (const [contactId, session] of Object.entries(currentSessions)) {
        serialized[contactId] = session.state;
      }
      localStorage.setItem('vextro_shield_sessions', JSON.stringify(serialized));
    } catch (e) {
      console.error('🛡️ [SHIELD WEB] SESSION_SAVE_ERROR:', e);
    }
  };

  /**
   * Start a new E2EE session with a contact
   */
  const startSession = async (contactId, remotePublicKey, initialRootKey) => {
    console.log(`🛡️ [SHIELD WEB] STARTING_SESSION: User <${contactId}>`);
    const session = await ShieldSession.init(initialRootKey, Buffer.from(remotePublicKey, 'base64'));
    
    const newSessions = { ...sessions, [contactId]: session };
    setSessions(newSessions);
    saveSessions(newSessions);
  };

  /**
   * Securely encrypt a message for a specific contact
   */
  const encryptFor = async (contactId, plaintext) => {
    const session = sessions[contactId];
    if (!session) throw new Error(`🛡️ [SHIELD] NO_SESSION for ${contactId}`);

    const result = await session.encrypt(plaintext);
    saveSessions(sessions); // Save state after ratchet progression
    return result;
  };

  /**
   * Decrypt an incoming message
   */
  const decryptFrom = async (contactId, header, ciphertext, nonce) => {
    const session = sessions[contactId];
    if (!session) throw new Error(`🛡️ [SHIELD] NO_SESSION for ${contactId}`);

    const plaintext = await session.decrypt(header, ciphertext, nonce);
    saveSessions(sessions); // Save state after ratchet progression
    return plaintext;
  };

  /**
   * [GROUP] Generates a 32-byte symmetric key and envelopes it for each member using nacl.box
   */
  const generateGroupKeyAndEnvelopes = (membersList) => {
    const groupSecretKey = nacl.randomBytes(32);
    const myPrivKeyRaw = localStorage.getItem('vextro_identity_private');
    const myPrivKey = Buffer.from(myPrivKeyRaw, 'base64');
    
    const envelopes = membersList.map(member => {
      const remotePubKey = Buffer.from(member.publicKey, 'base64');
      const nonce = nacl.randomBytes(24);
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
  const setupGroupSession = (groupId, encryptedKeyRaw, nonceRaw, adminPublicKeyRaw) => {
    const myPrivKeyRaw = localStorage.getItem('vextro_identity_private');
    const myPrivKey = Buffer.from(myPrivKeyRaw, 'base64');
    const adminPubKey = Buffer.from(adminPublicKeyRaw, 'base64');
    
    const decryptedKey = nacl.box.open(
      Buffer.from(encryptedKeyRaw, 'base64'),
      Buffer.from(nonceRaw, 'base64'),
      adminPubKey,
      myPrivKey
    );

    if (!decryptedKey) throw new Error("🛡️ [SHIELD] Pudełko klucza grupowego naruszone!");
    
    setGroupKeys(prev => ({ ...prev, [groupId]: decryptedKey }));
  };

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
