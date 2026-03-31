import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

class SecurityService {
    async initializeKeys() {
        try {
            console.log("🛡️ VEXTRO: Inicjalizacja bezpiecznych funkcji...");
            let deviceId = await SecureStore.getItemAsync('vextro_device_id');
            if (!deviceId) {
                deviceId = Math.random().toString(36).substring(2, 15);
                await SecureStore.setItemAsync('vextro_device_id', deviceId);
            }

            const mockPublicKey = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                deviceId
            );

            console.log("🛡️ VEXTRO: Klucze gotowe.");
            console.log("🛡️ VEXTRO: Klucz publiczny dla serwera:", mockPublicKey);
            
            return mockPublicKey;
        } catch (error) {
            console.error("❌ VEXTRO Security Error:", error);
            return null;
        }
    }

    // Dodajemy brakującą funkcję, żeby przycisk "Wyślij" nie wywalał błędu
    async encryptMessage(message) {
        console.log("🛡️ VEXTRO: Szyfrowanie wiadomości (Ghost Mode bypass)...");
        // Na tym etapie zwracamy czysty tekst, żebyśmy mogli testować backend
        return message; 
    }
}

export default new SecurityService();[]