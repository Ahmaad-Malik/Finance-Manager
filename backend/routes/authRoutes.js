const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateProfilePicture,
  removeProfilePicture,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Max 3 OTP-sending requests (register/resend) per 10 minutes per IP.
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { message: 'Too many OTP requests. Please try again later.' },
});

// Max 5 verification attempts per 10 minutes per IP.
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Too many attempts. Please try again later.' },
});

router.post('/register', otpRequestLimiter, registerUser);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/resend-otp', otpRequestLimiter, resendOtp);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// 'avatar' is the form field name the frontend must use for the file input
router.put('/profile/picture', protect, upload.single('avatar'), updateProfilePicture);
router.delete('/profile/picture', protect, removeProfilePicture);

module.exports = router;
