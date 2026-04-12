import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';
import { Buffer } from 'buffer';

// Seed PRNG for tweetnacl using Expo Crypto for secure random numbers
nacl.setPRNG((x, n) => {
  const randomBytes = Crypto.getRandomBytes(n);
  for (let i = 0; i < n; i++) {
    x[i] = randomBytes[i];
  }
});

class SecurityService {
    async initializeKeys() {
        try {
            console.log("🛡️ VEXTRO: Inicjalizacja bezpiecznych funkcji (Industrial-Grade E2EE)...");
            
            // Timeout dla SecureStore na wypadek zawieszenia (np. na starych symulatorach)
            const storageTask = Promise.all([
                SecureStore.getItemAsync('vextro_identity_public'),
                SecureStore.getItemAsync('vextro_identity_private')
            ]);
            
            const timeoutTask = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("STORAGE_TIMEOUT")), 4000)
            );

            let keys;
            try {
                keys = await Promise.race([storageTask, timeoutTask]);
            } catch (e) {
                console.warn('⚠️ [SHIELD] SECURE_STORE_TIMEOUT or ERROR. Generowanie ulotnych kluczy.', e.message);
                keys = [null, null];
            }

            let [pubKey, privKey] = keys;

            if (!pubKey || !privKey) {
                console.log("🛡️ VEXTRO: Generowanie nowej pary kluczy kryptograficznych...");
                const keyPair = nacl.box.keyPair();
                pubKey = Buffer.from(keyPair.publicKey).toString('base64');
                privKey = Buffer.from(keyPair.secretKey).toString('base64');

                try {
                    await SecureStore.setItemAsync('vextro_identity_public', pubKey);
                    // The private key must NEVER leave the device!
                    await SecureStore.setItemAsync('vextro_identity_private', privKey, {
                        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                    });
                    console.log("🛡️ VEXTRO: Nowe klucze wygenerowane i zapisane w SecureStore.");
                } catch (storageErr) {
                    console.error('❌ [SHIELD] SECURE_STORE_WRITE_ERROR:', storageErr.message);
                }
            } else {
                console.log("🛡️ VEXTRO: Klucze poprawnie odczytane z SecureStore.");
            }

            console.log("🛡️ VEXTRO: Klucz publiczny gotowy:", pubKey.substring(0, 15) + "...");
            
            return { publicKey: pubKey, privateKey: privKey };
        } catch (error) {
            console.error("❌ VEXTRO Security Error:", error);
            return null;
        }
    }

    async getPublicKey() {
        try {
            return await SecureStore.getItemAsync('vextro_identity_public');
        } catch (error) {
            console.error("❌ VEXTRO getPublicKey Error:", error);
            return null;
        }
    }
}

export default new SecurityService();