// Network Configuration (React Native)
/**
 * VEXTRO Network Configuration — Unified across mobile and web
 *
 * Supports dynamic URL configuration for QR-scanned servers.
 * Maintains hermetic references to avoid hostname issues on multi-network setups.
 */

import { Platform } from 'react-native';

// Fallback endpoint (useful for developer/local testing)
const FALLBACK_LAN_IP = '192.168.18.2';
const PORT = '5050';

const NetworkConfig = {
  VERSION: 1,
  CUSTOM_HUB_KEY: 'vextro_custom_hub',

  /**
   * Get base URL for REST API calls
   * Priority: custom hub > hostname:5050
   */
  getApiBase() {
    if (this._dynamicUrl) {
      return `${this._dynamicUrl}/api`;
    }
    return this.getFallbackUrl();
  },

  /**
   * Get Socket.io URL
   */
  getSocketUrl() {
    if (this._dynamicUrl) {
      return this._dynamicUrl;
    }
    return this.getFallbackUrl();
  },

  /**
   * Fallback URL (when no custom hub is set)
   * Uses hardcoded LAN IP as backup
   */
  getFallbackUrl() {
    return `http://${FALLBACK_LAN_IP}:${PORT}`;
  },

  /**
   * Set dynamic URL (from QR code or manual input)
   * Used for multi-hub configurations
   */
  setDynamicUrl(url) {
    console.log(`🔗 [NETWORK] Dynamic URL set: ${url}`);
    this._dynamicUrl = url;
  },

  /**
   * Clear dynamic URL (reset to fallback)
   */
  clearDynamicUrl() {
    console.log('🔗 [NETWORK] Dynamic URL cleared, reverting to fallback');
    this._dynamicUrl = null;
  },

  /**
   * Get current URL (for debugging)
   */
  getCurrentUrl() {
    return this.getSocketUrl();
  }
};

export default NetworkConfig;
