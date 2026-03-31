const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true, // Kluczowe dla synchronizacji kontaktów
    trim: true
  },
  publicKey: {
    type: String,
    required: true,
    unique: true, // Twój dotychczasowy klucz unikalny
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  // Opcjonalnie: flaga statusu (np. dla Ghost Mode w przyszłości)
  isGhost: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', UserSchema);