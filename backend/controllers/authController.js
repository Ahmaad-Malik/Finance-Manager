const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Otp = require('../models/otp');
const sendOtpEmail = require('../utils/mailer');

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateOtp = () => crypto.randomInt(100000, 1000000).toString(); // 6-digit code

const OTP_TTL_MS = 10 * 60 * 1000; // must match the TTL on the Otp model
const MAX_OTP_ATTEMPTS = 5;

// @route   POST /api/auth/register/request-otp
// @access  Public
// Body: { name, email, password }
// Registration is now two-step: this validates the form and emails a 6-digit
// code. The account itself isn't created until verifyRegisterOtp succeeds.
const requestRegisterOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Clear out any earlier pending OTP for this email, then store the new one.
    // Password is kept plain here (briefly) so User's own pre-save hook hashes
    // it the normal way once the account is actually created; this record
    // auto-deletes after 10 minutes regardless (see models/otp.js TTL index).
    await Otp.deleteMany({ email: email.toLowerCase().trim() });
    await Otp.create({ name, email, password, hashedOtp });

    await sendOtpEmail(email, otp, name);

    res.status(200).json({ message: 'OTP sent to your email', email });
  } catch (error) {
    console.error('Send registration OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// @route   POST /api/auth/register/verify-otp
// @access  Public
// Body: { email, otp }
// Confirms the code and, on success, actually creates the User account.
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = await Otp.findOne({ email: email.toLowerCase().trim() });
    if (!record) {
      return res.status(400).json({ message: 'No OTP request found for this email. Please request a new one.' });
    }

    const expired = Date.now() - record.createdAt.getTime() > OTP_TTL_MS;
    if (expired) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }

    // Guard against the rare case where the account was created in the meantime
    const userExists = await User.findOne({ email: record.email });
    if (userExists) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Password gets hashed automatically via the pre-save hook in User model
    const user = await User.create({
      name: record.name,
      email: record.email,
      password: record.password,
    });

    await Otp.deleteOne({ _id: record._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Verify registration OTP error:', error);
    res.status(500).json({ message: 'Server error verifying OTP', error: error.message });
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
  requestRegisterOtp,
  verifyRegisterOtp,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateProfilePicture,
  removeProfilePicture,
};
