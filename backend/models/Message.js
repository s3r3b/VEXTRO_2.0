const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderPhone: { 
        type: String, 
        required: true 
    },
    receiverPhone: { 
        type: String, 
        required: true, 
        index: true 
    },
    encryptedPayload: { 
        type: String, 
        required: true 
    },
    messageType: { 
        type: String, 
        default: 'text' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Message', MessageSchema);
