import { Router } from 'express';
import { login, register, logout, refresh, deleteAccount } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account. Password must be at least 6 characters. Rate-limited to 10 failed attempts per 15-minute window per IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - surname
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John
 *               surname:
 *                 type: string
 *                 example: Doe
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: SecurePassword123
 *               nationality:
 *                 type: string
 *                 example: Polish
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: '1995-06-15'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 7
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John
 *                     surname:
 *                       type: string
 *                       example: Doe
 *       400:
 *         description: Bad request - Missing or invalid fields (including password shorter than 6 characters)
 *       409:
 *         description: Conflict - An account with this email already exists
 *       429:
 *         description: Too Many Requests - Rate limit exceeded (10 failed attempts per 15 minutes per IP)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Too many requests
 *                 message:
 *                   type: string
 *                   example: Too many failed attempts, please try again in 15 minutes
 *       500:
 *         description: Internal server error
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to account
 *     description: Authenticate user and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Missing email or password
 *       401:
 *         description: Unauthorized - Invalid email or password
 *       429:
 *         description: Too Many Requests - Rate limit exceeded (10 failed attempts per 15 minutes per IP)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Too many requests
 *                 message:
 *                   type: string
 *                   example: Too many failed attempts, please try again in 15 minutes
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh JWT token
 *     description: Get a new JWT token using a valid existing token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     expiresIn:
 *                       type: string
 *                       example: 15m
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', authenticateToken, refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout from account
 *     description: Logout user (client should clear token from storage)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/account:
 *   delete:
 *     tags:
 *       - Authentication
 *     summary: Delete own account (self-service)
 *     description: |
 *       Permanently deletes the currently authenticated user's own account.
 *       Blocked with HTTP 409 if the user is the owner of any group trip that has at
 *       least one ACCEPTED participant — those trips must be transferred or deleted first.
 *       On success, Prisma CASCADE removes all owned solo trips, expenses/comments/packing
 *       items in other trips, participant records, documents, and notifications.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       409:
 *         description: Cannot delete — user owns group trips with accepted participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.delete('/account', authenticateToken, deleteAccount);

export default router;
