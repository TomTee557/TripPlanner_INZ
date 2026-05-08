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

    // Transfer ownership of group trips that have ACCEPTED participants
    const ownedGroupTrips = await prisma.trip.findMany({
      where: {
        userId: userId,
        participants: { some: { status: 'ACCEPTED' } }
      },
      include: {
        participants: {
          where: { status: 'ACCEPTED' },
          orderBy: { createdAt: 'asc' },
          take: 1
        }
      }
    });

    for (const trip of ownedGroupTrips) {
      const newOwner = trip.participants[0];
      if (newOwner) {
        await prisma.$transaction([
          prisma.trip.update({
            where: { id: trip.id },
            data: { userId: newOwner.userId }
          }),
          prisma.tripParticipant.delete({
            where: { id: newOwner.id }
          })
        ]);
      }
    }

    // Delete user (CASCADE will delete their owned trips without ACCEPTED participants,
    // expenses/comments in other trips, participant records, documents, notifications)
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

// ---------------------------------------------------------------------------
// Permissions management
// ---------------------------------------------------------------------------

// Valid feature flags
const VALID_PERMISSIONS = ['SMART_PACKING'] as const;
type ValidPermission = (typeof VALID_PERMISSIONS)[number];

/**
 * GET /api/admin/users/:id/permissions
 * Return list of permissions granted to a user.
 */
export const getUserPermissions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: { select: { permission: true } } }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      userId,
      permissions: user.permissions.map((p: { permission: string }) => p.permission)
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to fetch permissions.' });
  }
};

/**
 * PUT /api/admin/users/:id/permissions
 * Replace the full permission set for a user.
 * Body: { permissions: string[] }
 */
export const setUserPermissions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const { permissions } = req.body as { permissions: string[] };
    if (!Array.isArray(permissions)) {
      res.status(400).json({ error: 'permissions must be an array' });
      return;
    }

    const invalid = permissions.filter(
      (p) => !(VALID_PERMISSIONS as readonly string[]).includes(p)
    );
    if (invalid.length > 0) {
      res.status(400).json({
        error: 'Invalid permissions',
        message: `Unknown permissions: ${invalid.join(', ')}. Valid: ${VALID_PERMISSIONS.join(', ')}`
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Atomic replace: delete existing, create new
    await prisma.$transaction([
      prisma.userPermission.deleteMany({ where: { userId } }),
      ...(permissions as ValidPermission[]).map((p) =>
        prisma.userPermission.create({ data: { userId, permission: p } })
      )
    ]);

    res.status(200).json({
      success: true,
      userId,
      permissions
    });
  } catch (error) {
    console.error('Error setting user permissions:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to update permissions.' });
  }
};
