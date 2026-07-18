import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { updatePassword as updatePasswordApi } from '../api/authApi';

export default function Settings() {
  const { user, updateProfile } = useAuth();

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
      <h1>Settings</h1>

      <div className="section settings-section">
        <div className="section-header">
          <h2>Profile</h2>
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
          <h2>Change password</h2>
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
