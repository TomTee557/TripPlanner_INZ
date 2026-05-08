import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import type { User } from '@types';
import { UserRole } from '@utils/constants';
import type { UserRoleType } from '@utils/constants';
import api from '@services/api';
import './UserManagement.scss';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<'role' | 'password' | 'delete' | 'permissions' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRoleType>(UserRole.USER);
  const [passwordError, setPasswordError] = useState('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permError, setPermError] = useState('');
  const [permSaving, setPermSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // api.get() already returns response.data, not the full response
      const data: any = await api.get('/admin/users');
      console.log('API Data:', data);
      
      // Backend returns { success: true, users: [...] }
      if (data && data.users) {
        setUsers(data.users);
      } else {
        console.error('No users in data:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user: User, type: 'role' | 'password' | 'delete' | 'permissions') => {
    setSelectedUser(user);
    setModalType(type);
    setNewRole(user.role as UserRoleType);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPermError('');
    if (type === 'permissions') {
      // Fetch current permissions for this user
      api.get<any>(`/admin/users/${user.id}/permissions`)
        .then((data: any) => setUserPermissions(data.permissions ?? []))
        .catch(() => setUserPermissions([]));
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleChangeRole = async () => {
    if (selectedUser && newRole !== selectedUser.role) {
      try {
        await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
        await fetchUsers();
        closeModal();
      } catch (error) {
        console.error('Failed to change role:', error);
      }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (selectedUser) {
      try {
        await api.put(`/admin/users/${selectedUser.id}/password`, { password: newPassword });
        await fetchUsers();
        closeModal();
      } catch (error) {
        console.error('Failed to change password:', error);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await api.delete(`/admin/users/${selectedUser.id}`);
        await fetchUsers();
        closeModal();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const AVAILABLE_PERMISSIONS = [
    { key: 'SMART_PACKING', label: 'Smart Packing (AI trip planner)', description: 'Access to the AI-powered smart packing feature' },
  ];

  const togglePermission = (perm: string) => {
    setUserPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setPermSaving(true);
    setPermError('');
    try {
      await api.put(`/admin/users/${selectedUser.id}/permissions`, { permissions: userPermissions });
      closeModal();
    } catch (err: any) {
      setPermError(err?.response?.data?.message || 'Failed to update permissions.');
    } finally {
      setPermSaving(false);
    }
  };

  return (
    <div className="user-management">
      <h2 className="user-management__title">User Management</h2>
      
      {loading ? (
        <div className="user-management__loading">
          <div className="user-management__spinner" />
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="user-management__table-container">
          <table className="user-management__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`user-management__role user-management__role--${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="user-management__actions">
                      <button
                        className="user-management__action-btn user-management__action-btn--role"
                        onClick={() => openModal(user, 'role')}
                        title="Change Role"
                      >
                        Role
                      </button>
                      <button
                        className="user-management__action-btn user-management__action-btn--password"
                        onClick={() => openModal(user, 'password')}
                        title="Change Password"
                      >
                        Password
                      </button>
                      <button
                        className="user-management__action-btn user-management__action-btn--permissions"
                        onClick={() => openModal(user, 'permissions')}
                        title="Manage Permissions"
                      >
                        Permissions
                      </button>
                      <button
                        className="user-management__action-btn user-management__action-btn--delete"
                        onClick={() => openModal(user, 'delete')}
                        title="Delete User"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change Role Modal */}
      <Modal
        isOpen={modalType === 'role'}
        onClose={closeModal}
        title={`Change Role: ${selectedUser?.name}`}
        size="small"
      >
        <div className="user-management__modal-content">
          <p>Select new role for {selectedUser?.email}:</p>
          <div className="user-management__radio-group">
            <label>
              <input
                type="radio"
                value={UserRole.USER}
                checked={newRole === UserRole.USER}
                onChange={(e) => setNewRole(e.target.value as UserRoleType)}
              />
              <span>User</span>
            </label>
            <label>
              <input
                type="radio"
                value={UserRole.ADMIN}
                checked={newRole === UserRole.ADMIN}
                onChange={(e) => setNewRole(e.target.value as UserRoleType)}
              />
              <span>Admin</span>
            </label>
          </div>
        </div>
        <div className="user-management__modal-footer">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleChangeRole}
            disabled={newRole === selectedUser?.role}
          >
            Change Role
          </Button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={modalType === 'password'}
        onClose={closeModal}
        title={`Change Password: ${selectedUser?.name}`}
        size="small"
      >
        <div className="user-management__modal-content">
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            fullWidth
          />
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            error={passwordError}
            fullWidth
          />
        </div>
        <div className="user-management__modal-footer">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangePassword}>
            Change Password
          </Button>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Confirm Delete"
        size="small"
      >
        <div className="user-management__modal-content">
          <p>Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?</p>
          <p className="user-management__warning">This action cannot be undone.</p>
        </div>
        <div className="user-management__modal-footer">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={modalType === 'permissions'}
        onClose={closeModal}
        title={`Permissions: ${selectedUser?.name}`}
        size="small"
      >
        <div className="user-management__modal-content">
          <p className="user-management__perm-intro">Feature flags for <strong>{selectedUser?.email}</strong>:</p>
          <div className="user-management__perm-list">
            {AVAILABLE_PERMISSIONS.map(({ key, label, description }) => (
              <label key={key} className="user-management__perm-item">
                <input
                  type="checkbox"
                  className="user-management__perm-checkbox"
                  checked={userPermissions.includes(key)}
                  onChange={() => togglePermission(key)}
                />
                <div className="user-management__perm-text">
                  <span className="user-management__perm-label">{label}</span>
                  <span className="user-management__perm-desc">{description}</span>
                </div>
              </label>
            ))}
          </div>
          {permError && <p className="user-management__perm-error">{permError}</p>}
        </div>
        <div className="user-management__modal-footer">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePermissions} loading={permSaving}>
            Save Permissions
          </Button>
        </div>
      </Modal>
    </div>
  );
};
