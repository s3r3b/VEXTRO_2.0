/**
 * apiService.js — REST API layer for X3EE operations
 *
 * Adapted from /webapp/src/services/apiService.js for React Native
 * Uses NetworkConfig for dynamic URL configuration
 */

import axios from 'axios';
import NetworkConfig from './NetworkConfig';

const getApiBase = () => {
  return NetworkConfig.getApiBase();
};

export const apiService = {
  /**
   * Upload X3DH PreKey Bundle (used for secondary device registration)
   * @param {string} phoneNumber - User's phone number
   * @param {Object} bundle - X3DH bundle { identityKey, signedPreKey, oneTimePreKeys }
   */
  uploadKeys: async (phoneNumber, bundle) => {
    try {
      const response = await axios.post(`${getApiBase()}/keys/upload`, {
        phoneNumber,
        identityKey: bundle.identityKey,
        signedPreKey: bundle.signedPreKey,
        oneTimePreKeys: bundle.oneTimePreKeys
      });
      console.log('✅ [API] Keys uploaded successfully');
      return response.data;
    } catch (err) {
      console.error('❌ [API] uploadKeys error:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Fetch receiver's X3DH PreKey Bundle
   * @param {string} contactPhone - Contact's phone number
   * @returns {Object} - Pre-key bundle for key exchange
   */
  fetchReceiverKeys: async (contactPhone) => {
    try {
      const response = await axios.get(`${getApiBase()}/keys/fetch/${contactPhone}`);
      console.log(`✅ [API] Fetched keys for ${contactPhone}`);
      return response.data;
    } catch (err) {
      console.error(`❌ [API] fetchReceiverKeys error for ${contactPhone}:`, err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Send encrypted message
   * @param {string} senderPhone - Sender's phone
   * @param {string} receiverPhone - Receiver's phone
   * @param {string} encryptedPayload - Encrypted message (base64)
   * @param {string} messageType - Message type (default: 'text')
   */
  sendMessage: async (senderPhone, receiverPhone, encryptedPayload, messageType = 'text') => {
    try {
      const response = await axios.post(`${getApiBase()}/messages/send`, {
        senderPhone,
        receiverPhone,
        encryptedPayload,
        messageType
      });
      console.log(`✅ [API] Message sent: ${senderPhone} → ${receiverPhone}`);
      return response.data;
    } catch (err) {
      console.error('❌ [API] sendMessage error:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Retrieve messages for a phone (ATOMIC: fetches and deletes)
   * @param {string} phoneNumber - Phone number to retrieve messages for
   * @returns {Array} - Array of messages
   */
  retrieveMessages: async (phoneNumber) => {
    try {
      const response = await axios.get(`${getApiBase()}/messages/retrieve/${phoneNumber}`);
      console.log(`✅ [API] Retrieved ${response.data.length} messages for ${phoneNumber}`);
      return response.data;
    } catch (err) {
      console.error(`❌ [API] retrieveMessages error for ${phoneNumber}:`, err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Fetch user details (for group admin verification)
   * @param {string} phoneNumber - User's phone number
   */
  fetchUser: async (phoneNumber) => {
    try {
      const response = await axios.get(`${getApiBase()}/users/search/${phoneNumber}`);
      console.log(`✅ [API] Fetched user: ${phoneNumber}`);
      return response.data;
    } catch (err) {
      console.error(`❌ [API] fetchUser error for ${phoneNumber}:`, err.response?.data || err.message);
      throw err;
    }
  },
};

export default apiService;
