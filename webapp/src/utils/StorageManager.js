/**
 * StorageManager.js — Versioned localStorage wrapper
 *
 * Manages all vextro_* keys with versioning to prevent stale data issues.
 * Atomic cleaning on new registrations.
 *
 * Protocol: ATOMIC_E2EE_REGISTRATION_PROTOCOL
 * Date: 2026-04-13
 */

const StorageManager = {
  VERSION: 1,
  KEYS: {
    X3DH_LOCAL_KEYS: 'vextro_x3dh_local_keys_v1',
    USER_PHONE: 'vextro_user_phone_v1',
    IDENTITY_PUBLIC: 'vextro_identity_public_v1',
    SESSION_ID: 'vextro_session_id_v1',
    CUSTOM_HUB: 'vextro_custom_hub',
    // Legacy keys (for cleanup)
    LEGACY_X3DH: 'vextro_x3dh_local_keys',
    LEGACY_IDENTITY_PUBLIC: 'vextro_identity_public',
    LEGACY_USER_PHONE: 'userPhone',
    LEGACY_IDENTITY_PRIVATE: 'vextro_identity_private',

    LEGACY_CUSTOM_HUB: 'vextro_custom_hub',
  },

  /**
   * Clear ALL vextro_* keys (used on registration start)
   */
  clear() {
    console.log('🧹 [STORAGE] Clearing all vextro_* keys...');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vextro_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('✅ [STORAGE] Cleared.');
  },

 /**
   * Set X3DH local keys (ZMODYFIKOWANE: Ekstrakcja klucza prywatnego dla ShieldContext)
   * @param {Object} localKeys - { identityKeyPriv, signedPreKeyPriv, oneTimePreKeysPriv }
   */
  setX3DHKeys(localKeys) {
    if (!localKeys) throw new Error('StorageManager: Invalid X3DH local keys');
    try {
      // 1. Zapis pełnej paczki jako JSON
      localStorage.setItem(this.KEYS.X3DH_LOCAL_KEYS, JSON.stringify(localKeys));
      
     // 2. WYCIĄGNIĘCIE I ZAPIS LEGACY (Krytyczne dla ShieldContext.jsx)
      if (localKeys.identityKeyPriv) {
        localStorage.setItem('vextro_identity_private', localKeys.identityKeyPriv);
      }
      // NOWE: Zapis poprawnego klucza Curve25519 (ECDH) dla sesji X3DH
      if (localKeys.dhPrivKey) {
        localStorage.setItem('vextro_dh_private', localKeys.dhPrivKey);
      }
      
      console.log('✅ [STORAGE] X3DH local keys saved & unbundled.');
    } catch (e) {
      console.error('❌ [STORAGE] Error saving X3DH keys:', e);
      throw e;
    }
  },

  /**
   * Get X3DH local keys
   * @returns {Object|null} localKeys or null
   */
  getX3DHKeys() {
    const data = localStorage.getItem(this.KEYS.X3DH_LOCAL_KEYS);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('❌ [STORAGE] Failed to parse X3DH keys:', e);
      return null;
    }
  },

  /**
   * Set user phone (ZMODYFIKOWANE: Zapis podwójny dla kompatybilności)
   * @param {string} phone - Phone number
   */
  setUserPhone(phone) {
    try {
      localStorage.setItem(this.KEYS.USER_PHONE, phone); // Nowy standard
      localStorage.setItem('userPhone', phone); // LEGACY (czyta to ChatScreen)
      console.log(`✅ [STORAGE] User phone set: ${phone}`);
    } catch (e) {
      console.error('❌ [STORAGE] Error saving phone:', e);
      throw e;
    }
  },

  /**
   * Get user phone
   * @returns {string|null}
   */
  getUserPhone() {
    return localStorage.getItem(this.KEYS.USER_PHONE);
  },

  /**
   * Set identity public key (ZMODYFIKOWANE: Zapis podwójny dla kompatybilności)
   * @param {string} publicKey - Base64 encoded Ed25519 public key
   */
  setIdentityPublic(publicKey) {
    try {
      localStorage.setItem(this.KEYS.IDENTITY_PUBLIC, publicKey); // Nowy standard
      localStorage.setItem('vextro_identity_public', publicKey); // LEGACY
      console.log(`✅ [STORAGE] Identity public key set: ${publicKey.substring(0, 12)}...`);
    } catch (e) {
      console.error('❌ [STORAGE] Error saving identity public key:', e);
      throw e;
    }
  },

  /**
   * Get identity public key
   * @returns {string|null}
   */
  getIdentityPublic() {
    return localStorage.getItem(this.KEYS.IDENTITY_PUBLIC);
  },

  /**
   * Set session ID (for QR auth flow)
   * @param {string} sessionId
   */
  setSessionId(sessionId) {
    localStorage.setItem(this.KEYS.SESSION_ID, sessionId);
  },

  /**
   * Get session ID
   * @returns {string|null}
   */
  getSessionId() {
    return localStorage.getItem(this.KEYS.SESSION_ID);
  },

  /**
   * Check if user has X3DH keys (registered on this device)
   * @returns {boolean}
   */
  hasX3DHKeys() {
    return !!localStorage.getItem(this.KEYS.X3DH_LOCAL_KEYS);
  },

  /**
   * Check if user is logged in (has phone + keys)
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getUserPhone() && !!this.getX3DHKeys();
  },

  /**
   * Get version
   * @returns {number}
   */
  getVersion() {
    return this.VERSION;
  }
};

export default StorageManager;
