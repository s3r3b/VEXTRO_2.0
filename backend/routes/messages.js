const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

/**
 * DELETE /api/messages/:roomId
 * Wyczyść CAŁĄ historię wiadomości (logi P2P) w zadeklarowanym pokoju.
 */
router.delete('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await Message.deleteMany({ roomId });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('❌ [Messages] Błąd usuwania czatu:', err);
    res.status(500).json({ error: 'Błąd serwera podczas czyszczenia czatu.' });
  }
});

module.exports = router;
