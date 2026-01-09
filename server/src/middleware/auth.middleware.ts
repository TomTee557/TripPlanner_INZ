import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'Your session has expired. Please log in again.'
      });
      return;
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Your session is invalid. Please log in again.'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't block if missing
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
