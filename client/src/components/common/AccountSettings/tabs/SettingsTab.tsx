import { useState } from 'react';
import { changePassword, deleteAccount } from '@services/account.service';

interface SettingsTabProps {
  onAccountDeleted: () => void;
}

export const SettingsTab = ({ onAccountDeleted }: SettingsTabProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBlocked, setDeleteBlocked] = useState(false);

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

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteAccount();
      onAccountDeleted();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete account. Please try again.';
      setDeleteError(msg);
      setShowDeleteConfirm(false);
      if (err.response?.status === 409) {
        setDeleteBlocked(true);
      }
    } finally {
      setDeleteLoading(false);
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

      <div className="settings-tab__danger-zone">
        <h3 className="settings-tab__danger-title">Delete Account</h3>
        <p className="settings-tab__danger-desc">
          Once you delete your account, all your data will be permanently removed. This action cannot be undone.
        </p>

        {deleteError && (
          <div className="settings-tab__msg settings-tab__msg--error settings-tab__msg--block">
            {deleteError}
          </div>
        )}

        {!showDeleteConfirm ? (
          <button
            className="settings-tab__delete-btn"
            type="button"
            disabled={deleteBlocked}
            onClick={() => { setDeleteError(''); setShowDeleteConfirm(true); }}
          >
            Delete Account
          </button>
        ) : (
          <div className="settings-tab__confirm">
            <p className="settings-tab__confirm-text">Are you sure? This cannot be undone.</p>
            <div className="settings-tab__confirm-actions">
              <button
                className="settings-tab__delete-btn settings-tab__delete-btn--confirm"
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                className="settings-tab__cancel-btn"
                type="button"
                disabled={deleteLoading}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
