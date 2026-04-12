const nacl = require('tweetnacl');

/**
 * Zmienia format Base64 na bufor Uint8Array używany przez tweetnacl.
 * @param {string} base64String Ciąg znaków w Base64
 * @returns {Uint8Array} Tablica bajtów
 */
const base64ToUint8Array = (base64String) => {
    return new Uint8Array(Buffer.from(base64String, 'base64'));
};

/**
 * Weryfikuje podpis (Signature) dla podanego Signed PreKey (SPK) przy użyciu Identity Key (IK).
 * @param {string} spkBase64 - Signed PreKey zakodowany w Base64
 * @param {string} signatureBase64 - Podpis zakodowany w Base64
 * @param {string} ikBase64 - Identity Key zakodowany w Base64
 * @returns {boolean} - Zwraca true jeśli podpis jest prawidłowy, inaczej false
 */
const verifySignature = (spkBase64, signatureBase64, ikBase64) => {
    try {
        const spkBytes = base64ToUint8Array(spkBase64);
        const signatureBytes = base64ToUint8Array(signatureBase64);
        const ikBytes = base64ToUint8Array(ikBase64);

        // Używamy natywnej funkcji tweetnacl do weryfikacji podpisu na krzywej Ed25519
        const isValid = nacl.sign.detached.verify(
            spkBytes,       // Wiadomość (Klucz SPK w bajtach)
            signatureBytes, // Podpis w bajtach
            ikBytes         // Klucz publiczny weryfikujący w bajtach
        );

        return isValid;
    } catch (error) {
        console.error('❌ [x3dhVerify] Błąd weryfikacji podpisu:', error.message);
        return false; // W przypadku jakiegokolwiek błędu dekodowania lub konwersji, odrzucamy paczkę
    }
};

module.exports = {
    base64ToUint8Array,
    verifySignature
};
