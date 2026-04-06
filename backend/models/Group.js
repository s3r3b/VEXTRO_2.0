const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  encryptedKey: { type: String, required: true }, // Zaszyfrowany klucz symetryczny grupy dla tego użytkownika
});

const GroupSchema = new mongoose.Schema({
  groupName: { type: String, default: 'Grupa Szyfrowana' },
  adminPhone: { type: String, required: true },
  members: [MemberSchema], // Tablica członków z ich kopertami kluczy
  createdAt: { type: Date, default: Date.now },
  lastMessage: {
    content: { type: String, default: '' },
    timestamp: { type: Date, default: null },
  }
});

// Własne indeksowanie dla szybkiego dostępu (np. szukanie grup użytkownika)
GroupSchema.index({ 'members.phone': 1 });

module.exports = mongoose.model('Group', GroupSchema);
