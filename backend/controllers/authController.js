const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const sendOtpEmail = require('../config/mailer');
const { generateOtp, hashOtp, compareOtp, OTP_TTL_MS, MAX_ATTEMPTS } = require('../utils/otp');

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generates a fresh OTP, hashes it, stores it on the user (never the plain
// value), and emails the plain value to the user. The plain OTP is never
// returned from any API response.
const issueOtp = async (user) => {
  const otp = generateOtp();
  user.otpHash = await hashOtp(otp);
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  await sendOtpEmail(user.email, otp);
};

// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email }).select('+password');

    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    let user;
    if (existingUser && !existingUser.emailVerified) {
      // A previous registration attempt for this email never got verified
      // (OTP expired / never arrived / user abandoned it). Instead of
      // blocking with "already exists", refresh their details and send a
      // brand new OTP so they can pick up where they left off.
      existingUser.name = name;
      existingUser.password = password; // pre-save hook rehashes since it's modified
      user = await existingUser.save();
    } else {
      // Password gets hashed automatically via the pre-save hook in User model.
      // Account is created as unverified — it only becomes usable after OTP verification.
      user = await User.create({ name, email, password, emailVerified: false });
    }

    await issueOtp(user);

    // No token is returned here — the account isn't usable until the OTP is verified.
    res.status(201).json({
      message: 'Registration started. A verification code has been sent to your email.',
      email: user.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @route   POST /api/auth/verify-otp
// @access  Public
// Body: { email, otp }
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+otpHash +otpExpires +otpAttempts');
    if (!user) {
      return res.status(400).json({ message: 'No pending verification for this email' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (!user.otpHash || !user.otpExpires || Date.now() > user.otpExpires.getTime()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    const isMatch = await compareOtp(otp, user.otpHash);
    user.otpAttempts += 1;

    if (!isMatch) {
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // Success — mark verified and invalidate the OTP so it can't be reused.
    user.emailVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification', error: error.message });
  }
};

// @route   POST /api/auth/resend-otp
// @access  Public
// Body: { email }
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No pending verification for this email' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    await issueOtp(user);

    res.status(200).json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP', error: error.message });
  }
};

// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        email: user.email,
        needsVerification: true,
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  // req.user is set by authMiddleware
  res.status(200).json(req.user);
};

// @route   PUT /api/auth/profile
// @access  Private
// Body: { name }
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    res.status(200).json({ _id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture || '' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @route   PUT /api/auth/password
// @access  Private
// Body: { currentPassword, newPassword }
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Need the hash this time, so explicitly select it (schema excludes it by default)
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword; // pre-save hook rehashes automatically
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error updating password', error: error.message });
  }
};

// Deletes a previously uploaded avatar file from disk, ignoring any errors
// (e.g. file already gone). Never lets cleanup failures break the request.
const deleteOldAvatarFile = (profilePicturePath) => {
  if (!profilePicturePath) return;
  const filename = path.basename(profilePicturePath);
  const fullPath = path.join(__dirname, '..', 'uploads', filename);
  fs.unlink(fullPath, () => {});
};

// @route   PUT /api/auth/profile/picture
// @access  Private
// Form field: 'avatar' (multipart/form-data)
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    deleteOldAvatarFile(user.profilePicture);

    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: 'Server error updating profile picture', error: error.message });
  }
};

// @route   DELETE /api/auth/profile/picture
// @access  Private
const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    deleteOldAvatarFile(user.profilePicture);
    user.profilePicture = '';
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: '',
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ message: 'Server error removing profile picture', error: error.message });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateProfilePicture,
  removeProfilePicture,
};
