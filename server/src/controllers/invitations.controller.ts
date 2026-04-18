import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

/**
 * GET /api/invitations
 * Get all invitations for current user (both received and sent)
 */
export const getInvitations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    // Received invitations — I was invited to someone else's trip
    const received = await prisma.tripParticipant.findMany({
      where: { userId: req.user.id },
      include: {
        trip: {
          include: {
            user: { select: { id: true, email: true, name: true, surname: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Sent invitations — I own the trip and invited others
    const myTrips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      select: { id: true }
    });
    const myTripIds = myTrips.map(t => t.id);

    const sent = await prisma.tripParticipant.findMany({
      where: { tripId: { in: myTripIds } },
      include: {
        trip: { select: { id: true, title: true } },
        user: { select: { id: true, email: true, name: true, surname: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedReceived = received.map((inv: any) => ({
      id: inv.id,
      type: 'received' as const,
      tripId: inv.tripId,
      tripTitle: inv.trip.title,
      tripCountry: inv.trip.country,
      tripDateFrom: inv.trip.dateFrom.toISOString().split('T')[0],
      tripDateTo: inv.trip.dateTo.toISOString().split('T')[0],
      invitedBy: {
        id: inv.trip.user.id,
        email: inv.trip.user.email,
        name: inv.trip.user.name,
        surname: inv.trip.user.surname
      },
      status: inv.status,
      ownerSeen: inv.ownerSeen,
      createdAt: inv.createdAt.toISOString()
    }));

    const formattedSent = sent
      .filter((inv: any) => inv.status === 'PENDING')
      .map((inv: any) => ({
        id: inv.id,
        type: 'sent' as const,
        tripId: inv.tripId,
        tripTitle: inv.trip.title,
        participant: {
          id: inv.user.id,
          email: inv.user.email,
          name: inv.user.name,
          surname: inv.user.surname
        },
        status: inv.status,
        ownerSeen: inv.ownerSeen,
        createdAt: inv.createdAt.toISOString()
      }));

    const formattedConfirmations = sent
      .filter((inv: any) => inv.status !== 'PENDING' && inv.status !== 'LEFT')
      .map((inv: any) => ({
        id: inv.id,
        type: 'confirmation' as const,
        tripId: inv.tripId,
        tripTitle: inv.trip.title,
        participant: {
          id: inv.user.id,
          email: inv.user.email,
          name: inv.user.name,
          surname: inv.user.surname
        },
        status: inv.status,
        ownerSeen: inv.ownerSeen,
        createdAt: inv.createdAt.toISOString()
      }));

    // Messages — owners see LEFT responses; participants see TRIP_DELETED notifications
    const leftParticipants = sent.filter((inv: any) => inv.status === 'LEFT');
    const formattedLeft = leftParticipants.map((inv: any) => ({
      id: inv.id,
      source: 'participant' as const,
      type: 'LEFT' as const,
      tripTitle: inv.trip.title,
      detail: `${inv.user.name} ${inv.user.surname} (${inv.user.email}) left your trip.`,
      seen: inv.ownerSeen,
      createdAt: inv.createdAt.toISOString()
    }));

    const myNotifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    const formattedNotifications = myNotifications.map((n: any) => ({
      id: n.id,
      source: 'notification' as const,
      type: n.type as 'TRIP_DELETED' | 'TRIP_COMMENT',
      tripTitle: '',
      detail: n.message,
      seen: n.seen,
      createdAt: n.createdAt.toISOString()
    }));

    const messages = [
      ...formattedLeft,
      ...formattedNotifications
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      data: {
        received: formattedReceived,
        sent: formattedSent,
        confirmations: formattedConfirmations,
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to fetch invitations' });
  }
};

/**
 * PUT /api/invitations/:id/accept
 * Accept an invitation
 */
export const acceptInvitation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const invitation = await prisma.tripParticipant.findFirst({
      where: { id, userId: req.user.id, status: 'PENDING' }
    });

    if (!invitation) {
      res.status(404).json({ error: 'Not found', message: 'Pending invitation not found' });
      return;
    }

    await prisma.tripParticipant.update({
      where: { id },
      data: { status: 'ACCEPTED', ownerSeen: false }
    });

    res.status(200).json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to accept invitation' });
  }
};

/**
 * PUT /api/invitations/:id/decline
 * Decline an invitation
 */
export const declineInvitation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const invitation = await prisma.tripParticipant.findFirst({
      where: { id, userId: req.user.id, status: 'PENDING' }
    });

    if (!invitation) {
      res.status(404).json({ error: 'Not found', message: 'Pending invitation not found' });
      return;
    }

    await prisma.tripParticipant.update({
      where: { id },
      data: { status: 'REJECTED', ownerSeen: false }
    });

    res.status(200).json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to decline invitation' });
  }
};

/**
 * PUT /api/invitations/:id/confirm
 * Trip owner confirms they've seen the response
 */
export const confirmInvitation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    // Verify this invitation belongs to a trip I own
    const invitation = await prisma.tripParticipant.findFirst({
      where: { id },
      include: { trip: { select: { userId: true } } }
    });

    if (!invitation || invitation.trip.userId !== req.user.id) {
      res.status(404).json({ error: 'Not found', message: 'Invitation not found' });
      return;
    }

    await prisma.tripParticipant.update({
      where: { id },
      data: { ownerSeen: true }
    });

    res.status(200).json({ success: true, message: 'Invitation confirmed as seen' });
  } catch (error) {
    console.error('Error confirming invitation:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to confirm invitation' });
  }
};

/**
 * PUT /api/notifications/:id/mark-read
 * Mark a system notification as seen
 */
export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!notification) {
      res.status(404).json({ error: 'Not found', message: 'Notification not found' });
      return;
    }

    await prisma.notification.update({ where: { id }, data: { seen: true } });

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to update notification' });
  }
};

/**
 * DELETE /api/invitations/clear-read
 * Permanently delete invitations/notifications that have already been acted on
 * Safe to delete: REJECTED (participant never joined), LEFT (participant already left),
 *                 seen TRIP_DELETED notifications
 * NOT deleted:    ACCEPTED (participant still active), PENDING (not yet acted on)
 */
export const clearReadInvitations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    // My trips (to find confirmations/messages I own)
    const myTrips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      select: { id: true }
    });
    const myTripIds = myTrips.map((t: any) => t.id);

    // 1. My REJECTED received invitations (I rejected, never joined)
    const deletedReceived = await prisma.tripParticipant.deleteMany({
      where: { userId: req.user.id, status: 'REJECTED' }
    });

    // 2. Confirmations/messages I own: REJECTED or LEFT, already seen by me
    const deletedOwned = await prisma.tripParticipant.deleteMany({
      where: {
        tripId: { in: myTripIds },
        status: { in: ['REJECTED', 'LEFT'] },
        ownerSeen: true
      }
    });

    // 3. My seen TRIP_DELETED system notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: req.user.id, seen: true }
    });

    res.status(200).json({
      success: true,
      message: 'Read invitations cleared',
      data: {
        deletedReceived: deletedReceived.count,
        deletedOwned: deletedOwned.count,
        deletedNotifications: deletedNotifications.count
      }
    });
  } catch (error) {
    console.error('Error clearing read invitations:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to clear invitations' });
  }
};

/**
 * GET /api/invitations/notifications
 * Check if user has unhandled notifications (pending received or unseen sent responses)
 */
export const getNotificationCount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    // Count pending received invitations
    const pendingReceived = await prisma.tripParticipant.count({
      where: { userId: req.user.id, status: 'PENDING' }
    });

    // Count unseen responses on my trips (someone accepted/rejected and I haven't confirmed)
    const myTrips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      select: { id: true }
    });
    const myTripIds = myTrips.map(t => t.id);

    const unseenResponses = await prisma.tripParticipant.count({
      where: {
        tripId: { in: myTripIds },
        status: { in: ['ACCEPTED', 'REJECTED', 'LEFT'] },
        ownerSeen: false
      }
    });

    // Count unseen system notifications (e.g. TRIP_DELETED, TRIP_COMMENT)
    const unseenNotifications = await prisma.notification.count({
      where: { userId: req.user.id, seen: false }
    });

    res.status(200).json({
      success: true,
      data: {
        pendingReceived,
        unseenResponses,
        unseenNotifications,
        total: pendingReceived + unseenResponses + unseenNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to fetch notifications' });
  }
};
