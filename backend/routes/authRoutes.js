const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateProfilePicture,
  removeProfilePicture,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// 'avatar' is the form field name the frontend must use for the file input
router.put('/profile/picture', protect, upload.single('avatar'), updateProfilePicture);
router.delete('/profile/picture', protect, removeProfilePicture);

module.exports = router;
