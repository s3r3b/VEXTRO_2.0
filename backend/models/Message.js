const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    roomId: { type: String, required: true, index: true },
    sender: { type: String, required: true },
    content: { type: String, required: true }, // Zaszyfrowany tekst lub link do mediów
    type: { 
        type: String, 
        enum: ['text', 'voice', 'image', 'file'], 
        default: 'text' 
    },
    mediaUrl: { type: String }, // Opcjonalny URL do zaszyfrowanego pliku
    duration: { type: Number }, // Dla wiadomości głosowych w sekundach
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);