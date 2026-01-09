import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AuthenticatedRequest, UpdateUserRoleRequest, UpdateUserPasswordRequest } from '../types';

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export const getAllUsers = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Remove passwords from response
    const safeUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      users: safeUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch users. Please try again later.'
    });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Update user role (admin only)
 */
export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body as UpdateUserRoleRequest;

    // Validate user ID
    if (isNaN(userId)) {
      res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a number'
      });
      return;
    }

    // Validate role
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be USER or ADMIN'
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User with specified ID does not exist'
      });
      return;
    }

    // Update role
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to update user role. Please try again later.'
    });
  }
};

/**
 * PUT /api/admin/users/:id/password
 * Update user password (admin only)
 */
export const updateUserPassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { password } = req.body as UpdateUserPasswordRequest;

    // Validate user ID
    if (isNaN(userId)) {
      res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a number'
      });
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User with specified ID does not exist'
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'User password updated successfully'
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to update user password. Please try again later.'
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user (admin only)
 */
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    // Validate user ID
    if (isNaN(userId)) {
      res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a number'
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User with specified ID does not exist'
      });
      return;
    }

    // Prevent admin from deleting themselves
    if (req.user && req.user.id === userId) {
      res.status(400).json({
        error: 'Cannot delete yourself',
        message: 'You cannot delete your own account'
      });
      return;
    }

    // Delete user (CASCADE will delete related trips automatically)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to delete user. Please try again later.'
    });
  }
};
