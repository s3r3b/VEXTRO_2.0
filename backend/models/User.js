const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Format E.164 jest wymagany dla Shield Identity.']
  },
  publicKey: {
    type: String,
    required: true,
    unique: true,
  },
  // X3DH: Signed Prekey (Rotated periodically, signed by Identity Key)
  signedPreKey: {
    key: { type: String },
    signature: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  // X3DH: One-time Prekeys (Consumed on session init)
  oneTimePreKeys: [
    {
      key: { type: String },
      id: { type: String }  // Changed from Number to String (format: opk-TIMESTAMP-INDEX)
    }
  ],
  displayName: {
    type: String,
    default: function() {
       return this.phoneNumber;
    }
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  isGhost: {
    type: Boolean,
    default: false
  },
  expoPushToken: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('User', UserSchema);