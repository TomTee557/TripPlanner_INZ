import { Router } from 'express';
import { markNotificationRead } from '../controllers/invitations.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/notifications/{id}/mark-read:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Mark a system notification as read
 *     description: >
 *       Sets seen=true on a Notification record (e.g. TRIP_DELETED).
 *       Only the notification's owner can mark it as read.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification record ID
 *     responses:
 *       200:
 *         description: Notification marked as read
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
 *                   example: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found or not owned by user
 *       500:
 *         description: Internal server error
 */
router.put('/:id/mark-read', markNotificationRead);

export default router;
