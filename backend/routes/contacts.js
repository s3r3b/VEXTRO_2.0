const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const User = require('../models/User');

/**
 * GET /api/contacts/:ownerPhone
 * Pobiera listę kontaktów danego użytkownika.
 */
router.get('/:ownerPhone', async (req, res) => {
  const { ownerPhone } = req.params;
  try {
    const contacts = await Contact.find({ ownerPhone })
      .sort({ 'lastMessage.timestamp': -1, addedAt: -1 });
    res.json({ contacts });
  } catch (err) {
    console.error('❌ [Contacts] Błąd pobierania:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

/**
 * POST /api/contacts/add
 * Dodaje nowy kontakt po numerze telefonu.
 * Weryfikuje czy taki użytkownik istnieje w bazie VEXTRO.
 */
router.post('/add', async (req, res) => {
  const { ownerPhone, contactPhone, displayName } = req.body;

  if (!ownerPhone || !contactPhone) {
    return res.status(400).json({ error: 'Brakujące dane: ownerPhone i contactPhone są wymagane.' });
  }

  if (ownerPhone === contactPhone) {
    return res.status(400).json({ error: 'Nie możesz dodać siebie jako kontaktu.' });
  }

  try {
    // 1. Weryfikacja: czy ten numer jest zarejestrowany w VEXTRO?
    const targetUser = await User.findOne({ phoneNumber: contactPhone })
      .select('phoneNumber publicKey isGhost');

    if (!targetUser) {
      return res.status(404).json({ error: 'Ten numer nie jest zarejestrowany w sieci VEXTRO.' });
    }

    if (targetUser.isGhost) {
      return res.status(403).json({ error: 'Ten użytkownik jest w trybie Ghost — niedostępny.' });
    }

    // 2. Zapisanie kontaktu (upsert — unikamy duplikatów)
    const contact = await Contact.findOneAndUpdate(
      { ownerPhone, contactPhone },
      {
        ownerPhone,
        contactPhone,
        displayName: displayName || targetUser.phoneNumber,
        publicKey: targetUser.publicKey,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.status(201).json({ contact });
  } catch (err) {
    console.error('❌ [Contacts] Błąd dodawania:', err);
    res.status(500).json({ error: 'Błąd serwera podczas dodawania kontaktu.' });
  }
});

/**
 * DELETE /api/contacts/remove
 * Usuwa kontakt.
 */
router.delete('/remove', async (req, res) => {
  const { ownerPhone, contactPhone } = req.body;
  try {
    await Contact.deleteOne({ ownerPhone, contactPhone });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd usuwania kontaktu.' });
  }
});

/**
 * PATCH /api/contacts/last-message
 * Aktualizuje last message preview kontaktu (wywoływany przy wysłaniu wiadomości).
 */
router.patch('/last-message', async (req, res) => {
  const { ownerPhone, contactPhone, content, timestamp } = req.body;
  try {
    await Contact.updateOne(
      { ownerPhone, contactPhone },
      { 'lastMessage.content': content, 'lastMessage.timestamp': timestamp || new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd aktualizacji last message.' });
  }
});

/**
 * PATCH /api/contacts/status
 * Aktualizuje pole isMuted / isBlocked dla danego kontaktu.
 */
router.patch('/status', async (req, res) => {
  const { ownerPhone, contactPhone, isMuted, isBlocked } = req.body;
  try {
    const updatePayload = {};
    if (isMuted !== undefined) updatePayload.isMuted = isMuted;
    if (isBlocked !== undefined) updatePayload.isBlocked = isBlocked;

    const updated = await Contact.findOneAndUpdate(
      { ownerPhone, contactPhone },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );
    res.json({ success: true, contact: updated });
  } catch (err) {
    console.error("❌ [Contacts] Błąd ustawiana statusu:", err);
    res.status(500).json({ error: 'Błąd zmiany statusu' });
  }
});

module.exports = router;
