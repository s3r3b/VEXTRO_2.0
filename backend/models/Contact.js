const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  ownerPhone: {
    type: String,
    required: true,
    index: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    default: '',
  },
  publicKey: {
    type: String,
    default: '',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  isMuted: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  lastMessage: {
    content: { type: String, default: '' },
    timestamp: { type: Date, default: null },
  }
});

// Jeden właściciel nie może mieć tego samego kontaktu dwa razy
ContactSchema.index({ ownerPhone: 1, contactPhone: 1 }, { unique: true });

module.exports = mongoose.model('Contact', ContactSchema);
