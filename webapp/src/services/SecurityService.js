import nacl from 'tweetnacl';
import { Buffer } from 'buffer';

class SecurityService {
    initializeKeys() {
        try {
            console.log("🛡️ VEXTRO WEB: Inicjalizacja bezpiecznych funkcji (Industrial-Grade E2EE)...");
            
            let pubKey = localStorage.getItem('vextro_identity_public');
            let privKey = localStorage.getItem('vextro_identity_private');

            if (!pubKey || !privKey) {
                console.log("🛡️ VEXTRO WEB: Generowanie nowej pary kluczy kryptograficznych...");
                const keyPair = nacl.box.keyPair();
                pubKey = Buffer.from(keyPair.publicKey).toString('base64');
                privKey = Buffer.from(keyPair.secretKey).toString('base64');

                localStorage.setItem('vextro_identity_public', pubKey);
                // Klucz prywatny nigdy nie opuszcza przeglądarki użytkownika!
                localStorage.setItem('vextro_identity_private', privKey);
                console.log("🛡️ VEXTRO WEB: Nowe klucze wygenerowane i zapisane lokalnie.");
            } else {
                console.log("🛡️ VEXTRO WEB: Klucze odczytane z localStorage.");
            }

            console.log("🛡️ VEXTRO WEB: Klucz publiczny gotowy:", pubKey.substring(0, 15) + "...");
            
            return { publicKey: pubKey, privateKey: privKey };
        } catch (error) {
            console.error("❌ VEXTRO WEB Security Error:", error);
            return null;
        }
    }

    getPublicKey() {
        return localStorage.getItem('vextro_identity_public');
    }
}

export default new SecurityService();