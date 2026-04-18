import { Router } from 'express';
import { getComments, addComment, deleteComment } from '../controllers/comments.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/trips/{tripId}/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments for a trip
 *     description: Returns all comments for a trip. Only accessible by the trip owner and accepted participants.
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
 *         description: Comments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get('/trips/:tripId/comments', getComments);

/**
 * @swagger
 * /api/trips/{tripId}/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Add a comment to a trip
 *     description: >
 *       Creates a TripComment record and sends a TRIP_COMMENT Notification to all other
 *       accepted participants and the trip owner (excluding the commenter).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "I booked the hotel for nights 3-5!"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Empty message
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found or access denied
 *       500:
 *         description: Internal server error
 */
router.post('/trips/:tripId/comments', addComment);

/**
 * @swagger
 * /api/trips/{tripId}/comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Only the comment author or the trip owner can delete a comment.
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
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the author or owner
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/trips/:tripId/comments/:commentId', deleteComment);

export default router;
