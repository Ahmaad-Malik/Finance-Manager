import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, User, KeyRound, ImagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updatePassword as updatePasswordApi } from '../api/authApi';
import Avatar from '../components/Avatar';

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB, matches the backend limit

export default function Settings() {
  const { user, updateProfile, updateProfilePicture, removeProfilePicture } = useAuth();
  const navigate = useNavigate();

  // --- Profile picture ---
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarButtonClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so choosing the same file again still fires onChange
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error('Please choose a JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }

    setUploadingAvatar(true);
    try {
      await updateProfilePicture(file);
      toast.success('Profile picture updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    try {
      await removeProfilePicture();
      toast.success('Profile picture removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- Profile (name) form ---
  const [name, setName] = useState(user?.name || '');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Name is required.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(name.trim());
      toast.success('Name updated.');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update name.';
      setProfileError(message);
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Password form ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword) {
      setPasswordError('Both current and new password are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await updatePasswordApi({ currentPassword, newPassword });
      toast.success('Password updated.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update password.';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
          <span>Back</span>
        </button>
      </div>

      <h1>Settings</h1>

      <div className="section settings-section">
        <div className="section-header">
          <h2><ImagePlus size={17} strokeWidth={2.2} className="section-header-icon" /> Profile picture</h2>
        </div>

        <div className="avatar-upload-row">
          <Avatar name={user?.name} src={user?.profilePicture} className="settings-avatar" />

          <div className="avatar-actions">
            <button type="button" className="btn-secondary" onClick={handleAvatarButtonClick} disabled={uploadingAvatar}>
              {uploadingAvatar ? 'Uploading...' : 'Change photo'}
            </button>
            {user?.profilePicture && (
              <button
                type="button"
                className="btn-link btn-link--danger"
                onClick={handleAvatarRemove}
                disabled={uploadingAvatar}
              >
                Remove photo
              </button>
            )}
            <p className="avatar-hint">JPEG, PNG, or WEBP. Up to 5MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              hidden
            />
          </div>
        </div>
      </div>

      <div className="section settings-section">
        <div className="section-header">
          <h2><User size={17} strokeWidth={2.2} className="section-header-icon" /> Profile</h2>
        </div>

        <form className="settings-form" onSubmit={handleProfileSubmit}>
          {profileError && <div className="form-error">{profileError}</div>}

          <div className="form-field">
            <label htmlFor="settings-name">Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="settings-email">Email</label>
            <input id="settings-email" type="email" value={user?.email || ''} disabled />
            <p className="hint">Email address can't be changed.</p>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save name'}
            </button>
          </div>
        </form>
      </div>

      <div className="section settings-section">
        <div className="section-header">
          <h2><KeyRound size={17} strokeWidth={2.2} className="section-header-icon" /> Change password</h2>
        </div>

        <form className="settings-form" onSubmit={handlePasswordSubmit}>
          {passwordError && <div className="form-error">{passwordError}</div>}

          <div className="form-field">
            <label htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmNewPassword">Confirm new password</label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={passwordForm.confirmNewPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
