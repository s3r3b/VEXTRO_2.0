const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifySignature } = require('../utils/x3dhVerify');

// POST /api/keys/upload
router.post('/upload', async (req, res) => {
    try {
        const { phoneNumber, identityKey, signedPreKey, oneTimePreKeys } = req.body;

        if (!phoneNumber || !identityKey || !signedPreKey || !signedPreKey.key || !signedPreKey.signature) {
            return res.status(400).json({ error: 'Brakujące wymagane pola w paczce PreKey.' });
        }

        // 1. Wyszukanie użytkownika w bazie (Tożsamość Mongoose)
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ error: 'Nie znaleziono tożsamości dla tego numeru.' });
        }

        // 2. Weryfikacja Identity Key (IK) w bazie z dostarczonym w paczce
        if (user.publicKey !== identityKey) {
            return res.status(403).json({ error: 'Mismatch: Identity Key niezgodny z zarejestrowanym w bazie.' });
        }

        // 3. Walidacja kryptograficzna Signed PreKey na zabezpieczenie przed Bundle Poisoning
        const isValidSignature = verifySignature(signedPreKey.key, signedPreKey.signature, identityKey);

        if (!isValidSignature) {
            console.warn(`🛑 [SECURITY] Odrzucono fałszywy Signed PreKey dla tożsamości: ${phoneNumber}`);
            return res.status(400).json({ error: 'Nieprawidłowy podpis Signed PreKey. Paczka odrzucona przez X3DH Verify.' });
        }

        // 4. Mechanizm chroniący serwer przed przepełnieniem (DoS Storage) - max 100 OPK
        let newOpks = [];
        if (Array.isArray(oneTimePreKeys)) {
            newOpks = oneTimePreKeys.slice(0, 100);
        }

        // 5. Zapis paczki w bazie
        user.signedPreKey = {
            key: signedPreKey.key,
            signature: signedPreKey.signature,
            createdAt: new Date()
        };
        
        user.oneTimePreKeys = newOpks;

        await user.save();

        console.log(`🔑 [X3DH] Odświeżono PreKey Bundle dla tożsamości: ${phoneNumber} (${newOpks.length} OPK)`);
        res.status(200).json({ success: true, message: 'PreKey Bundle został pomyślnie i bezpiecznie zaktualizowany.' });

    } catch (err) {
        console.error('❌ [Keys] Błąd podczas przesyłania paczki kluczy:', err);
        res.status(500).json({ error: 'Błąd serwera podczas zapisu wtyczki PreKey.' });
    }
});

// GET /api/keys/fetch/:phone
router.get('/fetch/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        const user = await User.findOne({ phoneNumber: phone });
        if (!user) {
            return res.status(404).json({ error: 'Nie znaleziono tożsamości docelowej w sieci VEXTRO.' });
        }

        if (!user.signedPreKey || !user.signedPreKey.key) {
            return res.status(404).json({ error: 'Ten użytkownik nie wysłał jeszcze paczki kluczy.' });
        }

        const bundle = {
            identityKey: user.publicKey,
            signedPreKey: {
                key: user.signedPreKey.key,
                signature: user.signedPreKey.signature
            },
            oneTimePreKey: null
        };

        // Mechanizm kolejkowania FIFO (Zdejmij i usuń z bazy pierwszy dostępny OPK)
        if (user.oneTimePreKeys && user.oneTimePreKeys.length > 0) {
            // Pobranie pierwszego elementu i modyfikacja oryginalnej struktury w pamięci operacyjnej
            const consumedOpk = user.oneTimePreKeys.shift();
            
            bundle.oneTimePreKey = {
                id: consumedOpk.id,
                key: consumedOpk.key
            };

            // Flaga modyfikacji dla modelu Mongoose
            user.markModified('oneTimePreKeys');
            await user.save(); // Atomowy zapis na serwerze - usuwamy zużyty klucz bezpowrotnie
            
            console.log(`🔑 [X3DH] Wydano One-Time PreKey (ID: ${consumedOpk.id}) dla węzła ${phone}. W puli zostało: ${user.oneTimePreKeys.length} szt.`);
        } else {
            console.warn(`⚠️ [X3DH] OTP Exhaustion (Brak wolnych OPK) dla ${phone}! Zwrócono okrojoną paczkę z przejściem do 3-DH.`);
        }

        res.status(200).json(bundle);

    } catch (err) {
        console.error('❌ [Keys] Błąd podczas pobierania paczki kluczy:', err);
        res.status(500).json({ error: 'Błąd po stronie serwera Relay.' });
    }
});

module.exports = router;
