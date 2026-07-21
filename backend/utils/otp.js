const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// How long a generated OTP stays valid for.
const OTP_TTL_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

// crypto.randomInt is cryptographically secure (unlike Math.random()).
function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString(); // 6-digit
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function compareOtp(otp, hash) {
  if (!hash) return false;
  return bcrypt.compare(otp, hash);
}

module.exports = { generateOtp, hashOtp, compareOtp, OTP_TTL_MS, MAX_ATTEMPTS };
