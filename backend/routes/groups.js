const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

/**
 * POST /api/groups/create
 * Tworzy nową grupę szyfrowaną za pomocą "Symmetric Envelope Method".
 * Wymaga tablicy `members` w formacie { phone, encryptedKey }
 */
router.post('/create', async (req, res) => {
  const { groupName, adminPhone, members } = req.body;

  if (!adminPhone || !members || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: 'Nieprawidłowe dane wejściowe. Oczekiwano adminPhone oraz tablicy members.' });
  }

  try {
    const newGroup = new Group({
      groupName: groupName || 'Grupa Szyfrowana',
      adminPhone,
      members, // Zawiera już asymetrycznie zakodowane obwiednie kluczy (envelopes)
    });

    await newGroup.save();
    
    // Zwracamy stworzoną grupę do UI admina, by od razu widział ją na liście
    res.status(201).json({ group: newGroup });
  } catch (err) {
    console.error('❌ [Groups] Błąd tworzenia grupy:', err);
    res.status(500).json({ error: 'Błąd serwera podczas tworzenia grupy.' });
  }
});

/**
 * GET /api/groups/:userPhone
 * Zwraca listę grup, do których należy użytkownik.
 */
router.get('/:userPhone', async (req, res) => {
  const { userPhone } = req.params;

  try {
    // MongoDB automatycznie skorzysta tu z naszego indeksu na 'members.phone'
    const groups = await Group.find({ 'members.phone': userPhone })
      .sort({ 'lastMessage.timestamp': -1, createdAt: -1 });
    
    res.json({ groups });
  } catch (err) {
    console.error('❌ [Groups] Błąd pobierania list grup:', err);
    res.status(500).json({ error: 'Błąd pobierania danych z bazy.' });
  }
});

/**
 * PATCH /api/groups/last-message
 * Aktualizuje last message dla grupy po wysłaniu wiadomości.
 */
router.patch('/last-message', async (req, res) => {
  const { groupId, content, timestamp } = req.body;
  try {
    await Group.findByIdAndUpdate(groupId, {
      'lastMessage.content': content,
      'lastMessage.timestamp': timestamp || new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd aktualizacji metadanych grupy.' });
  }
});

module.exports = router;
