const mongoose = require('mongoose');

// Full history of every registration OTP request — kept permanently (not
// auto-deleted) so you have an audit trail of who requested a code and when.
// The actual User document is only created once verified=true here.
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
  // Plain password, needed only until the account is actually created (so
  // User's existing pre-save hook can hash it the normal way). Cleared out
  // (see verifyRegisterOtp) right after the account is made — everything
  // else on this record is kept for history.
  password: {
    type: String,
  },
  hashedOtp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // No `expires` here on purpose — records are kept, not auto-deleted.
  },
});

module.exports = mongoose.model('Otp', otpSchema);
