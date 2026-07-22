const mongoose = require('mongoose');

// Holds a pending registration until the user verifies their email with the OTP.
// The actual User document is only created after successful verification.
const otpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  // Plain password, held only for the short OTP window so that User's existing
  // pre-save hook can hash it the normal way once the account is actually created.
  // This document self-destructs (see TTL index below), so it's never kept around.
  password: {
    type: String,
    required: true,
  },
  hashedOtp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // TTL: MongoDB auto-deletes this document 600s (10 min) after createdAt
  },
});

module.exports = mongoose.model('Otp', otpSchema);
