// Ścieżka: /workspaces/VEXTRO/frontend/src/services/NetworkConfig.js

/**
 * VEXTRO Network Configuration
 * Centralne miejsce zarządzania adresami API i Socket.io.
 */
// Plik: NetworkConfig.js
const LAN_IP = '192.168.18.2';
const PORT = '5050';

export const SERVER_URL = `http://${LAN_IP}:${PORT}`;
export const SOCKET_URL = `ws://${LAN_IP}:${PORT}`;

const NetworkConfig = {
    BASE_URL: SERVER_URL,
    SOCKET_URL: SOCKET_URL, 

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
        return this.BASE_URL;
    }
};

export default NetworkConfig;