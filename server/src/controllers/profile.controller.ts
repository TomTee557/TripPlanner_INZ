import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

/**
 * GET /api/profile
 * Get current user's profile
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
        birthday: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Not found', message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : null,
        createdAt: user.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to fetch profile' });
  }
};

/**
 * PUT /api/profile
 * Update current user's profile (birthday)
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { birthday } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        birthday: birthday ? new Date(birthday) : null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to update profile' });
  }
};

/**
 * PUT /api/profile/password
 * Change own password
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        error: 'Validation error',
        message: 'New password must be at least 6 characters long'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({ error: 'Not found', message: 'User not found' });
      return;
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      res.status(400).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to change password' });
  }
};
