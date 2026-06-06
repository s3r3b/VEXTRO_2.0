const MessageSchema = new mongoose.Schema({
    roomId: {                      // ✅ DODAJ (dla zgodności z server.js)
        type: String,
        required: false,
        index: true
    },
    sender: {                      // ✅ DODAJ
        type: String,
        required: false
    },
    senderPhone: { 
        type: String, 
        required: true 
    },
    receiverPhone: { 
        type: String, 
        required: true, 
        index: true 
    },
    content: {                     // ✅ ZMIENIĆ z encryptedPayload
        type: String, 
        required: true 
    },
    messageType: { 
        type: String, 
        default: 'text' 
    },
    isEncrypted: {                 // ✅ DODAJ (do przyszłego użytku)
        type: Boolean,
        default: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Message', MessageSchema);