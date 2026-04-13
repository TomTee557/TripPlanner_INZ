import { Router } from 'express';
import { checkUserByEmail, getParticipants, removeParticipant } from '../controllers/participants.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/users/check-email:
 *   post:
 *     tags:
 *       - Participants
 *     summary: Check if user exists by email
 *     description: Verify if a user with the given email exists (for adding trip participants)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.post('/users/check-email', checkUserByEmail);

/**
 * @swagger
 * /api/trips/{tripId}/participants:
 *   get:
 *     tags:
 *       - Participants
 *     summary: Get trip participants
 *     description: Get all participants for a specific trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of participants
 *       404:
 *         description: Trip not found
 *       401:
 *         description: Unauthorized
 */
router.get('/trips/:tripId/participants', getParticipants);

/**
 * @swagger
 * /api/trips/{tripId}/participants/{participantId}:
 *   delete:
 *     tags:
 *       - Participants
 *     summary: Remove participant from trip
 *     description: Remove a participant from a specific trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Participant removed successfully
 *       404:
 *         description: Trip or participant not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/trips/:tripId/participants/:participantId', removeParticipant);

export default router;
