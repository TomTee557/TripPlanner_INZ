import { Router } from 'express';
import { login, register, logout, refresh } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Response: { success: true, token: string, user: { email, name, role } }
 */
router.post('/login', login);

/**
 * POST /api/auth/register
 * Body: { email: string, name: string, surname: string, password: string }
 * Response: { success: true, message: string }
 */
router.post('/register', register);

/**
 * POST /api/auth/refresh
 * Header: Authorization: Bearer <token>
 * Response: { success: true, token: string, expiresIn: string }
 */
router.post('/refresh', authenticateToken, refresh);

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 * Response: { success: true, message: string }
 */
router.post('/logout', logout);

export default router;
