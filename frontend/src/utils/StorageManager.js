/**
 * StorageManager.js — Versioned AsyncStorage wrapper (React Native)
 *
 * Manages all vextro_* keys with versioning to prevent stale data issues.
 * Atomic cleaning on new registrations.
 *
 * Adapted from /webapp/src/utils/StorageManager.js for React Native AsyncStorage
 *
 * Protocol: ATOMIC_E2EE_REGISTRATION_PROTOCOL
 * Date: 2026-04-13
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageManager = {
  VERSION: 1,
  KEYS: {
    X3DH_LOCAL_KEYS: 'vextro_x3dh_local_keys_v1',
    USER_PHONE: 'vextro_user_phone_v1',
    IDENTITY_PUBLIC: 'vextro_identity_public_v1',
    SESSION_ID: 'vextro_session_id_v1',
    GROUP_KEYS: 'vextro_group_keys_v1',
    CUSTOM_HUB: 'vextro_custom_hub',
    // Legacy keys (for cleanup)
    LEGACY_X3DH: 'vextro_x3dh_local_keys',
    LEGACY_IDENTITY_PUBLIC: 'vextro_identity_public',
    LEGACY_USER_PHONE: 'userPhone',
    LEGACY_IDENTITY_PRIVATE: 'vextro_identity_private',
    LEGACY_CUSTOM_HUB: 'vextro_custom_hub',
  },

  /**
   * Clear ALL vextro_* keys (used on registration start/error)
   * ATOMIC cleanup to prevent partial state
   */
  async clear() {
    console.log('🧹 [STORAGE] Clearing all vextro_* keys...');
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => key.startsWith('vextro_'));

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`✅ [STORAGE] Cleared ${keysToRemove.length} keys.`);
      } else {
        console.log('✅ [STORAGE] No keys to clear.');
      }
    } catch (e) {
      console.error('❌ [STORAGE] Error clearing keys:', e);
      throw e;
    }
  },

  /**
   * Set X3DH local keys (private keys)
   * @param {Object} localKeys - { identityKeyPriv, signedPreKeyPriv, oneTimePreKeysPriv }
   */
  async setX3DHKeys(localKeys) {
    if (!localKeys) throw new Error('StorageManager: Invalid X3DH local keys');
    try {
      await AsyncStorage.setItem(this.KEYS.X3DH_LOCAL_KEYS, JSON.stringify(localKeys));
      console.log('✅ [STORAGE] X3DH local keys saved.');
    } catch (e) {
      console.error('❌ [STORAGE] Error saving X3DH keys:', e);
      throw e;
    }
  },

  /**
   * Get X3DH local keys
   * @returns {Promise<Object|null>} localKeys or null
   */
  async getX3DHKeys() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.X3DH_LOCAL_KEYS);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('❌ [STORAGE] Failed to parse X3DH keys:', e);
      return null;
    }
  },

  /**
   * Set user phone
   * @param {string} phone - Phone number
   */
  async setUserPhone(phone) {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_PHONE, phone);
      console.log(`✅ [STORAGE] User phone set: ${phone}`);
    } catch (e) {
      console.error('❌ [STORAGE] Error saving phone:', e);
      throw e;
    }
  },

  /**
   * Get user phone
   * @returns {Promise<string|null>}
   */
  async getUserPhone() {
    try {
      return await AsyncStorage.getItem(this.KEYS.USER_PHONE);
    } catch (e) {
      console.error('❌ [STORAGE] Error retrieving phone:', e);
      return null;
    }
  },

  /**
   * Set identity public key (X3DH identity key public)
   * @param {string} publicKey - Base64 encoded Ed25519 public key
   */
  async setIdentityPublic(publicKey) {
    try {
      await AsyncStorage.setItem(this.KEYS.IDENTITY_PUBLIC, publicKey);
      console.log(`✅ [STORAGE] Identity public key set: ${publicKey.substring(0, 12)}...`);
    } catch (e) {
      console.error('❌ [STORAGE] Error saving identity public key:', e);
      throw e;
    }
  },

  /**
   * Get identity public key
   * @returns {Promise<string|null>}
   */
  async getIdentityPublic() {
    try {
      return await AsyncStorage.getItem(this.KEYS.IDENTITY_PUBLIC);
    } catch (e) {
      console.error('❌ [STORAGE] Error retrieving identity public key:', e);
      return null;
    }
  },

  /**
   * Set session ID (for QR auth flow)
   * @param {string} sessionId
   */
  async setSessionId(sessionId) {
    try {
      await AsyncStorage.setItem(this.KEYS.SESSION_ID, sessionId);
      console.log(`✅ [STORAGE] Session ID set.`);
    } catch (e) {
      console.error('❌ [STORAGE] Error saving session ID:', e);
      throw e;
    }
  },

  /**
   * Get session ID
   * @returns {Promise<string|null>}
   */
  async getSessionId() {
    try {
      return await AsyncStorage.getItem(this.KEYS.SESSION_ID);
    } catch (e) {
      console.error('❌ [STORAGE] Error retrieving session ID:', e);
      return null;
    }
  },

  /**
   * Check if user has X3DH keys (registered on this device)
   * @returns {Promise<boolean>}
   */
  async hasX3DHKeys() {
    try {
      const keys = await AsyncStorage.getItem(this.KEYS.X3DH_LOCAL_KEYS);
      return !!keys;
    } catch (e) {
      console.error('❌ [STORAGE] Error checking X3DH keys:', e);
      return false;
    }
  },

  /**
   * Check if user is logged in (has phone + keys)
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    try {
      const phone = await this.getUserPhone();
      const keys = await this.getX3DHKeys();
      return !!phone && !!keys;
    } catch (e) {
      console.error('❌ [STORAGE] Error checking login status:', e);
      return false;
    }
  },

  /**
   * Get version
   * @returns {number}
   */
  getVersion() {
    return this.VERSION;
  },

  /**
   * Persist group keys (NEW for frontend)
   * @param {Object} groupKeys - { [groupId]: base64(key), ... }
   */
  async setGroupKeys(groupKeys) {
    try {
      await AsyncStorage.setItem(this.KEYS.GROUP_KEYS, JSON.stringify(groupKeys));
      console.log('✅ [STORAGE] Group keys persisted.');
    } catch (e) {
      console.error('❌ [STORAGE] Error saving group keys:', e);
      throw e;
    }
  },

  /**
   * Load group keys
   * @returns {Promise<Object|null>}
   */
  async getGroupKeys() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.GROUP_KEYS);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('❌ [STORAGE] Failed to parse group keys:', e);
      return null;
    }
  },
};

export default StorageManager;
