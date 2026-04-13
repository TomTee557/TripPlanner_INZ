import { Router } from 'express';
import {
  getInvitations,
  acceptInvitation,
  declineInvitation,
  confirmInvitation,
  getNotificationCount
} from '../controllers/invitations.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getInvitations);
router.get('/notifications', getNotificationCount);
router.put('/:id/accept', acceptInvitation);
router.put('/:id/decline', declineInvitation);
router.put('/:id/confirm', confirmInvitation);

export default router;
