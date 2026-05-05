import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { LoginRequest, RegisterRequest } from '../types';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
      return;
    }

    // Find user by email (case-insensitive)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Wrong email or password'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Wrong email or password'
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      } as object,
      jwtSecret as jwt.Secret,
      { expiresIn } as jwt.SignOptions
    );

    // Return token and user info
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to process login. Please try again later.'
    });
  }
};

/**
 * POST /api/auth/register
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, surname, password } = req.body as RegisterRequest;

    // Validate input
    if (!email || !name || !surname || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, name, surname and password are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        surname: surname.trim(),
        password: hashedPassword,
        role: 'USER' // Default role
      }
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to create account. Please try again later.'
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh JWT token for authenticated user
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get current user from authenticated request
    const user = (req as any).user;

    if (!user || !user.id) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in again'
      });
      return;
    }

    // Verify user still exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      res.status(401).json({
        error: 'User not found',
        message: 'Please log in again'
      });
      return;
    }

    // Generate new JWT token
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    const token = jwt.sign(
      {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role
      } as object,
      jwtSecret as jwt.Secret,
      { expiresIn } as jwt.SignOptions
    );

    // Return new token
    res.status(200).json({
      success: true,
      token,
      expiresIn
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to refresh session. Please log in again.'
    });
  }
};

/**
 * DELETE /api/auth/account
 * Delete the authenticated user's own account.
 * Blocked when the user still owns group trips with accepted participants.
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    // Check for group trips (owned trips that have at least one ACCEPTED participant)
    const ownedGroupTrips = await prisma.trip.findMany({
      where: {
        userId: user.id,
        participants: { some: { status: 'ACCEPTED' } }
      },
      select: { id: true, title: true }
    });

    if (ownedGroupTrips.length > 0) {
      res.status(409).json({
        error: 'Cannot delete account',
        message: `You cannot delete your account while you are the owner of group trip(s): ${ownedGroupTrips.map((t: any) => `"${t.title}"`).join(', ')}. Please transfer ownership or delete those trips first.`
      });
      return;
    }

    // Delete the user — Prisma cascades will remove their solo trips, expenses, documents, etc.
    await prisma.user.delete({ where: { id: user.id } });

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to delete account. Please try again later.' });
  }
};
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // For stateless JWT, logout is handled client-side by removing token
  // This endpoint exists for consistency and future token blacklisting if needed
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
