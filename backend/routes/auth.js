const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ============================================================
// VEXTRO Auth Router v2.1 — Atomic E2EE Registration
// Klucze X3DH są rejestrowane ATOMICZNIE razem z kontem.
// Zero dwu-etapowego uploadu. Zero race conditions.
// ============================================================

const verifyMockCode = (phone, code) => {
    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    const isAdmin = (normalizedPhone === '+48798884532' || normalizedPhone === '48798884532');
    return code === (isAdmin ? '8958' : '1234');
};

// ----------------------------------------------------
// 1. CREATE ACCOUNT — Rejestracja z atomicznym bundle E2EE
// POST /api/auth/register
// Body: { phoneNumber, code, publicKey, signedPreKey?, oneTimePreKeys? }
// ----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, code, publicKey, signedPreKey, oneTimePreKeys } = req.body;

    // --- Walidacja wejściowa ---
    if (!phoneNumber || !code) {
        return res.status(400).json({ error: 'Brak danych: numer telefonu i kod są wymagane.' });
    }
    if (!publicKey) {
        return res.status(400).json({ error: 'Brak klucza tożsamości (publicKey). Shield nie zainicjowany.' });
    }

    const normalizedPhone = phoneNumber.replace(/[^\d+]/g, '');

    if (!verifyMockCode(normalizedPhone, code)) {
      return res.status(401).json({ error: 'Nieprawidłowy kod weryfikacyjny.' });
    }

    // --- Sprawdź duplikat numeru ---
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser) {
      return res.status(409).json({ error: 'Ten numer jest już zarejestrowany. Użyj opcji Log-in.' });
    }

    // --- Atomiczne tworzenie użytkownika z kluczami E2EE ---
    // ENFORCE: All X3DH keys REQUIRED (protocol: ONE REQUEST, ONE KEYSET, ZERO CONFLICTS)
    if (!signedPreKey?.key || !signedPreKey?.signature) {
      return res.status(400).json({
        error: 'Brak signedPreKey — X3DH registration wymaga pełnego bundle.'
      });
    }
    if (!Array.isArray(oneTimePreKeys) || oneTimePreKeys.length === 0) {
      return res.status(400).json({
        error: 'Brak oneTimePreKeys — X3DH wymaga minimum 50 kluczy.'
      });
    }

    const userPayload = {
      phoneNumber: normalizedPhone,
      publicKey: publicKey,
      signedPreKey: signedPreKey,
      oneTimePreKeys: oneTimePreKeys,
    };

    const newUser = await User.create(userPayload);

    console.log(`🛡️ VEXTRO: NOWY AGENT ZAREJESTROWANY [${normalizedPhone}] | PublicKey: ${publicKey.substring(0, 12)}...`);
    
    // Nigdy nie zwracamy prywatnych danych — tylko to co potrzeba na froncie
    res.status(201).json({
      message: 'Konto utworzone. Shield aktywny.',
      user: {
        id: newUser._id,
        phoneNumber: newUser.phoneNumber,
        displayName: newUser.displayName,
      }
    });

  } catch (err) {
    console.error("❌ Błąd bazy danych:", err);
    if (err.code === 11000) {
        // Duplicate key — może to numer, może publicKey
        const field = Object.keys(err.keyPattern || {})[0] || 'pole';
        return res.status(409).json({ error: `Konflikt tożsamości: ${field} już istnieje w bazie.` });
    }
    res.status(500).json({ error: 'Błąd serwera przy rejestracji.' });
  }
});

// ----------------------------------------------------
// 2. LOG-IN — Weryfikacja tożsamości
// POST /api/auth/login
// Body: { phoneNumber, code }
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
        return res.status(400).json({ error: 'Brak danych: numer telefonu i kod są wymagane.' });
    }

    const normalizedPhone = phoneNumber.replace(/[^\d+]/g, '');

    if (!verifyMockCode(normalizedPhone, code)) {
      return res.status(401).json({ error: 'Nieprawidłowy kod weryfikacyjny.' });
    }

    const user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user) {
      return res.status(404).json({ error: 'Nie znaleziono konta. Zarejestruj się najpierw.' });
    }

    user.lastSeen = new Date();
    await user.save();

    console.log(`🛡️ VEXTRO: AGENT ZALOGOWANY [${normalizedPhone}]`);
    
    // Przy logowaniu zwracamy publicKey — klient może zweryfikować tożsamość
    res.status(200).json({
      message: 'Zalogowano pomyślnie.',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        publicKey: user.publicKey, // Potrzebne do weryfikacji E2EE po stronie klienta
      }
    });

  } catch (err) {
    console.error("❌ Błąd logowania:", err);
    res.status(500).json({ error: 'Błąd serwera przy logowaniu.' });
  }
});

module.exports = router;