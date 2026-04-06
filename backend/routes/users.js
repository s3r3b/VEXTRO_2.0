const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users/sync
// Sprawdza, które z przesłanych numerów istnieją w VEXTRO
router.post('/sync', async (req, res) => {
  const { contacts } = req.body; // Oczekujemy tablicy: ["+48123...", "+48987..."]

  if (!contacts || !Array.isArray(contacts)) {
    return res.status(400).json({ error: "Nieprawidłowy format danych kontaktów" });
  }

  try {
    // Szukamy użytkowników, których numery są w przesłanej liście
    const foundUsers = await User.find({ 
      phoneNumber: { $in: contacts } 
    }).select('phoneNumber publicKey lastSeen'); 

    res.json({ registeredContacts: foundUsers });
  } catch (err) {
    console.error("Błąd synchronizacji:", err);
    res.status(500).json({ error: "Błąd serwera podczas synchronizacji" });
  }
});

// GET /api/users/search/:phone
// Wyszukuje konkretnego użytkownika po dokładnie podanym numerze telefonu w bazie
router.get('/search/:phone', async (req, res) => {
  const phoneToFind = req.params.phone;

  if (!phoneToFind) {
    return res.status(400).json({ error: "Nie podano numeru do wyszukania" });
  }

  try {
    const user = await User.findOne({ phoneNumber: phoneToFind }).select('phoneNumber publicKey lastSeen isGhost');
    
    if (!user) {
      return res.status(404).json({ error: "Użytkownik z tym numerem nie używa VEXTRO" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Błąd wyszukiwania kontaktu:", err);
    res.status(500).json({ error: "Błąd bazy danych" });
  }
});
// GET /api/users/all
// Pobiera listę wszystkich dostępnych, nieskrytych użytkowników sieci VEXTRO
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({ isGhost: false }).select('phoneNumber publicKey lastSeen').limit(100);
    res.json({ users });
  } catch (err) {
    console.error("Błąd pobierania bazy:", err);
    res.status(500).json({ error: "Błąd bazy danych" });
  }
});

/**
 * PATCH /api/users/pushtoken
 * Rejestruje lub aktualizuje natywny token (ExpoPushToken) dla podanego numeru
 */
router.patch('/pushtoken', async (req, res) => {
  const { phoneNumber, expoPushToken } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Nie podano numeru' });

  try {
    const updatedUser = await User.findOneAndUpdate(
      { phoneNumber },
      { $set: { expoPushToken } },
      { new: true }
    );
    if (!updatedUser) {
       return res.status(404).json({ error: 'Użytkownik nie istnieje w VEXTRO' });
    }
    res.json({ success: true, message: 'Push Token zaktualizowany' });
  } catch (err) {
    console.error("Błąd zapisu tokena push:", err);
    res.status(500).json({ error: 'Błąd po stronie bazy.' });
  }
});

module.exports = router;