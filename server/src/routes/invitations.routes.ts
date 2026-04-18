import { Router } from 'express';
import {
  getInvitations,
  acceptInvitation,
  declineInvitation,
  confirmInvitation,
  getNotificationCount,
  clearReadInvitations,
} from '../controllers/invitations.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/invitations:
 *   get:
 *     tags:
 *       - Invitations
 *     summary: Get all invitations and messages
 *     description: >
 *       Returns four arrays for the authenticated user:
 *       **received** (PENDING invitations to join others' trips),
 *       **sent** (PENDING invitations I sent as trip owner),
 *       **confirmations** (ACCEPTED/REJECTED responses on my trips),
 *       **messages** (LEFT and TRIP_DELETED system notifications).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invitations and messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InvitationsData'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getInvitations);

/**
 * @swagger
 * /api/invitations/notifications:
 *   get:
 *     tags:
 *       - Invitations
 *     summary: Get notification counts (badge)
 *     description: >
 *       Returns numeric counts used for the notification badge in the UI header.
 *       Polled every 2 minutes and on login.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationCount'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/notifications', getNotificationCount);

/**
 * @swagger
 * /api/invitations/{id}/accept:
 *   put:
 *     tags:
 *       - Invitations
 *     summary: Accept a trip invitation
 *     description: Sets invitation status to ACCEPTED and clears ownerSeen flag so the trip owner is notified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: TripParticipant record ID
 *     responses:
 *       200:
 *         description: Invitation accepted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pending invitation not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/accept', acceptInvitation);

/**
 * @swagger
 * /api/invitations/{id}/decline:
 *   put:
 *     tags:
 *       - Invitations
 *     summary: Decline a trip invitation
 *     description: Sets invitation status to REJECTED and clears ownerSeen flag so the trip owner is notified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: TripParticipant record ID
 *     responses:
 *       200:
 *         description: Invitation declined
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pending invitation not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/decline', declineInvitation);

/**
 * @swagger
 * /api/invitations/{id}/confirm:
 *   put:
 *     tags:
 *       - Invitations
 *     summary: Mark a confirmation as seen by owner
 *     description: >
 *       Trip owner acknowledges an ACCEPTED or REJECTED response.
 *       Sets ownerSeen=true on the TripParticipant record.
 *       Also used to mark LEFT messages as read (ownerSeen=true).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: TripParticipant record ID
 *     responses:
 *       200:
 *         description: Confirmation marked as seen
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invitation not found or not owned by user
 *       500:
 *         description: Internal server error
 */
router.put('/:id/confirm', confirmInvitation);

/**
 * @swagger
 * /api/invitations/clear-read:
 *   delete:
 *     tags:
 *       - Invitations
 *     summary: Delete all acted-on invitations and read notifications
 *     description: >
 *       Permanently removes records that no longer need to be shown:
 *       - My REJECTED received invitations (I rejected, never joined)
 *       - REJECTED or LEFT participants on my trips where ownerSeen=true
 *       - Seen TRIP_DELETED system notifications (Notification table)
 *
 *       **Not deleted:** ACCEPTED (participant still active), PENDING (not yet acted on).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Read invitations cleared successfully
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
 *                     deletedReceived:
 *                       type: integer
 *                       description: Number of deleted received invitations
 *                       example: 2
 *                     deletedOwned:
 *                       type: integer
 *                       description: Number of deleted owned-trip participant records
 *                       example: 1
 *                     deletedNotifications:
 *                       type: integer
 *                       description: Number of deleted system notifications
 *                       example: 0
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/clear-read', clearReadInvitations);

export default router;

