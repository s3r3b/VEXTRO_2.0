const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * POST /send
 * Accept: sender, receiver, payload
 * Validation: Ensure both users exist
 * Action: Save to MongoDB
 */
router.post('/send', async (req, res) => {
    try {
        const { sender, receiver, payload, messageType } = req.body;

        if (!sender || !receiver || !payload) {
            return res.status(400).json({ error: 'Missing sender, receiver, or payload.' });
        }

        // Validation: Ensure both users exist in the system.
        const senderUser = await User.findOne({ phoneNumber: sender });
        const receiverUser = await User.findOne({ phoneNumber: receiver });

        if (!senderUser || !receiverUser) {
            return res.status(404).json({ error: 'Sender or receiver does not exist.' });
        }

        const newMessage = await Message.create({
            senderPhone: sender,
            receiverPhone: receiver,
            encryptedPayload: payload,
            messageType: messageType || 'text'
        });

        res.status(201).json({ success: true, messageId: newMessage._id });
    } catch (err) {
        // IRON RULE: No logs should ever print the 'encryptedPayload' content.
        console.error('❌ [Messages] Error saving message for receiver:', req.body.receiver);
        res.status(500).json({ error: 'Server error during message sending.' });
    }
});

/**
 * GET /retrieve/:phone
 * Find all messages for the given phone number.
 * Action: Return the messages AND IMMEDIATELY DELETE them (Atomic retrieval).
 */
router.get('/retrieve/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        // Retrieve the messages
        const messages = await Message.find({ receiverPhone: phone }).lean();

        // Immediately delete them using the retrieved IDs to ensure atomic-like behavior
        // where we only delete what we are returning.
        if (messages.length > 0) {
            const messageIds = messages.map(m => m._id);
            await Message.deleteMany({ _id: { $in: messageIds } });
        }

        // Return the messages (Zero Knowledge persistence)
        res.json({ success: true, messages });
    } catch (err) {
        console.error('❌ [Messages] Error retrieving messages for phone:', req.params.phone);
        res.status(500).json({ error: 'Server error during message retrieval.' });
    }
});

module.exports = router;
