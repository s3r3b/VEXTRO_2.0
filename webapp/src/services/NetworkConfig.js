// Ścieżka: /workspaces/VEXTRO/webapp/src/services/NetworkConfig.js

/**
 * VEXTRO Webapp Network Configuration
 * Centralny punkt styku z infrastrukturą VEXTRO Hub.
 */
const NetworkConfig = {
    // Backend VEXTRO
    // Dzięki proxy w Vite, '/socket.io' i '/api' są automatycznie 
    // kierowane na właściwy port (5050 w dev).
    getSocketUrl() {
        // W deweloperce zwracamy po prostu origin, Vite zajmie się resztą.
        return window.location.origin;
    },

    getApiBase() {
        return '/api';
    }
};

export default NetworkConfig;
