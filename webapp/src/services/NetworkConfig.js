// Ścieżka: /workspaces/VEXTRO/webapp/src/services/NetworkConfig.js

/**
 * VEXTRO Webapp Network Configuration
 * Omijamy Vite Proxy - celujemy bezpośrednio w Node.js (port 5050)
 */
const NetworkConfig = {
    getSocketUrl() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        // Bezpośredni strzał do backendu VEXTRO
        return `${protocol}//${hostname}:5050`;
    },

    getApiBase() {
        return `${this.getSocketUrl()}/api`;
    }
};

export default NetworkConfig;