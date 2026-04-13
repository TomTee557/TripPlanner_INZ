import { useState } from 'react';
import { changePassword } from '@services/account.service';

export const SettingsTab = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccessMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-tab">
      <h3 className="settings-tab__title">Change Password</h3>
      <form className="settings-tab__form" onSubmit={handleSubmit}>
        <div className="settings-tab__field">
          <label className="settings-tab__label">Current Password</label>
          <input
            className="settings-tab__input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="settings-tab__field">
          <label className="settings-tab__label">New Password</label>
          <input
            className="settings-tab__input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="settings-tab__field">
          <label className="settings-tab__label">Confirm New Password</label>
          <input
            className="settings-tab__input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && <div className="settings-tab__msg settings-tab__msg--error">{error}</div>}
        {successMsg && <div className="settings-tab__msg settings-tab__msg--success">{successMsg}</div>}

        <button className="settings-tab__submit" type="submit" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};
