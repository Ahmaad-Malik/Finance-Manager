const express = require('express');
const router = express.Router();
const {
  requestRegisterOtp,
  verifyRegisterOtp,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateProfilePicture,
  removeProfilePicture,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { otpRequestLimiter, otpVerifyLimiter } = require('../middleware/otpRateLimiter');

// Registration is now two-step: request an OTP, then verify it to create the account.
router.post('/register/request-otp', otpRequestLimiter, requestRegisterOtp);
router.post('/register/verify-otp', otpVerifyLimiter, verifyRegisterOtp);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// 'avatar' is the form field name the frontend must use for the file input
router.put('/profile/picture', protect, upload.single('avatar'), updateProfilePicture);
router.delete('/profile/picture', protect, removeProfilePicture);

module.exports = router;
