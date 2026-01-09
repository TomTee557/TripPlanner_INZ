// Logic for user management (admin only)
// GET /api/users, POST /api/users/role, POST /api/users/password

import { TripApiLogic } from './TripApiLogic.js';

export class UserManagementLogic {
    
    /**
     * Get all users (admin only)
     * @returns {Promise<Object>} Server response with users array
     */
    static async getUsers() {
        try {
            console.log('UserManagementLogic: Fetching all users...');
            
            const result = await TripApiLogic.request('/api/users', {
                method: 'GET'
            });
            
            console.log('UserManagementLogic: Users fetched successfully:', result.users.length, 'users');
            
            return result;
            
        } catch (error) {
            console.error('UserManagementLogic: Failed to fetch users:', error.message);
            throw error;
        }
    }
    
    /**
     * Update user role (admin only)
     * @param {number} userId - User ID
     * @param {string} role - New role (USER or ADMIN)
     * @returns {Promise<Object>} Server response
     */
    static async updateUserRole(userId, role) {
        try {
            console.log('UserManagementLogic: Updating user role...', { userId, role });
            
            const result = await TripApiLogic.request('/api/users/role', {
                method: 'POST',
                body: JSON.stringify({ userId, role })
            });
            
            console.log('UserManagementLogic: User role updated successfully');
            
            return result;
            
        } catch (error) {
            console.error('UserManagementLogic: Failed to update user role:', error.message);
            throw error;
        }
    }
    
    /**
     * Update user password (admin only)
     * @param {number} userId - User ID
     * @param {string} password - New password
     * @returns {Promise<Object>} Server response
     */
    static async updateUserPassword(userId, password) {
        try {
            console.log('UserManagementLogic: Updating user password...', { userId });
            
            const result = await TripApiLogic.request('/api/users/password', {
                method: 'POST',
                body: JSON.stringify({ userId, password })
            });
            
            console.log('UserManagementLogic: User password updated successfully');
            
            return result;
            
        } catch (error) {
            console.error('UserManagementLogic: Failed to update user password:', error.message);
            throw error;
        }
    }
    
    /**
     * Delete user (admin only)
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Server response
     */
    static async deleteUser(userId) {
        try {
            console.log('UserManagementLogic: Deleting user...', { userId });
            
            const result = await TripApiLogic.request('/api/users/delete', {
                method: 'POST',
                body: JSON.stringify({ userId })
            });
            
            console.log('UserManagementLogic: User deleted successfully');
            
            return result;
            
        } catch (error) {
            console.error('UserManagementLogic: Failed to delete user:', error.message);
            throw error;
        }
    }
}
