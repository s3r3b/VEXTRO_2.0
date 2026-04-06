const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Endpoint do weryfikacji kodu i SEAMLESS IDENTITY (Login/Register)
router.post('/verify-code', async (req, res) => {
  try {
    const { phoneNumber, code, publicKey } = req.body;

    if (!phoneNumber || !code || !publicKey) {
      return res.status(400).json({ error: 'Brakujące dane: phoneNumber, code i publicKey są wymagane.' });
    }

    // Normalizacja numeru (Cleaning non-numeric except '+')
    const normalizedPhone = phoneNumber.replace(/[^\d+]/g, '');
    const isAdmin = (normalizedPhone === '+48798884532' || normalizedPhone === '48798884532');

    // MOCK: Weryfikacja kodu (8958 dla ADMINA, 1234 dla reszty)
    if (isAdmin) {
      console.log(`📡 [ADMIN_AUTH] Próba logowania tożsamości: ${normalizedPhone}`);
    }
    
    const requiredCode = isAdmin ? '8958' : '1234';
    if (code !== requiredCode) {
      return res.status(401).json({ error: 'Nieprawidłowy kod weryfikacyjny dla tej tożsamości.' });
    }

    // Proba UPSERTU tożsamości Shield
    let user;
    try {
      user = await User.findOneAndUpdate(
        { phoneNumber },
        { 
          phoneNumber, 
          publicKey,
          lastSeen: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
      );
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        // Kolizja klucza publicznego z innym numerem
        return res.status(409).json({ 
          error: 'Shield Identity Conflict: Ten klucz publiczny jest już przypisany do innego numeru. Wygeneruj nową tożsamość lub użyj poprzedniego numeru.' 
        });
      }
      throw dbErr;
    }

    console.log(`🛡️ VEXTRO: IDENTITY_SYNC: ${phoneNumber} [${user._id}]`);
    
    res.status(200).json({ 
      message: 'Shield Identity Verified',
      user: {
        phoneNumber: user.phoneNumber,
        publicKey: user.publicKey,
        displayName: user.displayName || user.phoneNumber
      }
    });
  } catch (err) {
    console.error('❌ Błąd weryfikacji:', err);
    res.status(500).json({ error: 'Błąd serwera podczas weryfikacji tożsamości.' });
  }
});

module.exports = router;