// Ścieżka: /workspaces/VEXTRO/frontend/src/services/NetworkConfig.js

/**
 * VEXTRO Network Configuration
 * Centralne miejsce zarządzania adresami API i Socket.io.
 * System discovery dla środowisk deweloperskich i produkcyjnych.
 * 
 * DEFEKT #1 FIX: Dodany dynamiczny URL discovery.
 * Mobilna apka nie powinna polegać na hardcoded IP — adres backendu
 * jest teraz wyciągany z zawartości QR kodu (pole `server`).
 * Hardcoded BASE_URL służy wyłącznie jako fallback dla chat/API.
 */
const NetworkConfig = {
    // PODSTAWOWY ADRES BACKENDU (FALLBACK)
    // Używany tylko do chat/API kiedy nie ma dynamicznego URL
    BASE_URL: 'http://192.168.18.2:5050', 
    
    // DYNAMICZNY URL z QR (ustawiany podczas skanowania)
    _dynamicUrl: null,

    /**
     * Ustawia dynamiczny URL pobrany z QR kodu.
     * Wywoływane przez QRScannerScreen po zeskanowaniu.
     */
    setDynamicUrl(url) {
        this._dynamicUrl = url;
        console.log(`📡 [NetworkConfig] Dynamic URL set: ${url}`);
    },

    /**
     * Czyści dynamiczny URL (po rozłączeniu sesji).
     */
    clearDynamicUrl() {
        this._dynamicUrl = null;
    },

    getSocketUrl() {
        // Priorytet: dynamiczny URL z QR → hardcoded fallback
        if (this._dynamicUrl) {
            return this._dynamicUrl;
        }
        return this.BASE_URL;
    },

    getBypassHeaders() {
        return {
            'bypass-tunnel-reminder': 'true'
        };
    }
};

export default NetworkConfig;
