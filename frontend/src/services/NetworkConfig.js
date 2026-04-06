// Ścieżka: /workspaces/VEXTRO/frontend/src/services/NetworkConfig.js

/**
 * VEXTRO Network Configuration
 * Centralne miejsce zarządzania adresami API i Socket.io.
 */
const NetworkConfig = {
    // PUBLICZNY TUNEL VEXTRO HUB (Active Session)
    // To tutaj Twój fizyczny telefon łączy się z serwerem w chmurze Google.
    // SYNC_DISCOVERY_MODE: Telefon oczekuje na sygnał z Twojego terminala (QR Scan).
    BASE_URL: 'PENDING_HUB_DISCOVERY', 
    
    _dynamicUrl: null,

    setDynamicUrl(url) {
        this._dynamicUrl = url;
    },

    clearDynamicUrl() {
        this._dynamicUrl = null;
    },

    getSocketUrl() {
        if (this._dynamicUrl) {
            return this._dynamicUrl;
        }

        // AUTO-DISCOVERY: Zawsze używamy tunelu publicznego dla sesji chmurowych.
        return this.BASE_URL; 
    },

    getBypassHeaders() {
        return {
            'bypass-tunnel-reminder': 'true',
            'User-Agent': 'vextro-node-client'
        };
    }
};

export default NetworkConfig;
