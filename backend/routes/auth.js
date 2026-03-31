const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Endpoint do rejestracji klucza publicznego
router.post('/register', async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: 'Brak klucza publicznego' });
    }

    // Sprawdzamy, czy użytkownik już istnieje
    let user = await User.findOne({ publicKey });

    if (!user) {
      user = new User({ publicKey });
      await user.save();
      console.log(`🛡️ VEXTRO: Nowy użytkownik zarejestrowany: ${publicKey.substring(0, 10)}...`);
      return res.status(201).json({ message: 'Zarejestrowano pomyślnie' });
    }

    res.status(200).json({ message: 'Użytkownik już istnieje' });
  } catch (err) {
    console.error('❌ Błąd rejestracji:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;