const rateLimit = require('express-rate-limit');

// Limits how often someone can ask for a new OTP to be emailed (per IP)
const otpRequestLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5,
  message: { message: 'Too many OTP requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limits how many times someone can attempt to verify a code (per IP)
const otpVerifyLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 15,
  message: { message: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpRequestLimiter, otpVerifyLimiter };
