import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

/**
 * GET /api/trips/:tripId/comments
 * Get all comments for a trip (owner + accepted participants only)
 */
export const getComments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { tripId } = req.params;

    // Verify user has access to this trip (owner or accepted participant)
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { participants: { some: { userId: req.user.id, status: 'ACCEPTED' } } }
        ]
      }
    });

    if (!trip) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found or access denied' });
      return;
    }

    const comments = await prisma.tripComment.findMany({
      where: { tripId },
      include: {
        user: { select: { id: true, name: true, surname: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formatted = comments.map((c: any) => ({
      id: c.id,
      tripId: c.tripId,
      message: c.message,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.user.id,
        name: c.user.name,
        surname: c.user.surname,
        email: c.user.email
      }
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to fetch comments' });
  }
};

/**
 * POST /api/trips/:tripId/comments
 * Add a comment to a trip. Notifies all other accepted participants and the owner.
 */
export const addComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { tripId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Validation error', message: 'Message cannot be empty' });
      return;
    }

    // Verify access (owner or accepted participant)
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { participants: { some: { userId: req.user.id, status: 'ACCEPTED' } } }
        ]
      },
      include: {
        participants: {
          where: { status: 'ACCEPTED' },
          select: { userId: true }
        }
      }
    });

    if (!trip) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found or access denied' });
      return;
    }

    // Trim and limit length
    const trimmedMessage = message.trim().slice(0, 1000);

    // Create the comment
    const comment = await prisma.tripComment.create({
      data: {
        tripId,
        userId: req.user.id,
        message: trimmedMessage
      },
      include: {
        user: { select: { id: true, name: true, surname: true, email: true } }
      }
    });

    // Notify all other participants (accepted) + owner, except the commenter
    const authorName = req.user.email;
    const notifMessage = `${authorName} added a message to trip "${trip.title}": "${trimmedMessage.slice(0, 80)}${trimmedMessage.length > 80 ? '...' : ''}"`;

    const recipientIds = new Set<number>();
    // Owner
    if (trip.userId !== req.user.id) recipientIds.add(trip.userId);
    // Accepted participants
    for (const p of trip.participants) {
      if (p.userId !== req.user.id) recipientIds.add(p.userId);
    }

    if (recipientIds.size > 0) {
      await prisma.notification.createMany({
        data: Array.from(recipientIds).map((userId) => ({
          userId,
          type: 'TRIP_COMMENT',
          message: notifMessage,
          seen: false
        }))
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        tripId: comment.tripId,
        message: comment.message,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: (comment as any).user.id,
          name: (comment as any).user.name,
          surname: (comment as any).user.surname,
          email: (comment as any).user.email
        }
      }
    });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      res.status(404).json({ error: 'Not found', message: 'This trip no longer exists — it may have been deleted by the owner.' });
      return;
    }
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to add comment' });
  }
};

/**
 * DELETE /api/trips/:tripId/comments/:commentId
 * Delete a comment. Allowed: the comment author OR the trip owner.
 */
export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { tripId, commentId } = req.params;

    const comment = await prisma.tripComment.findFirst({
      where: { id: commentId, tripId },
      include: { trip: { select: { userId: true } } }
    });

    if (!comment) {
      res.status(404).json({ error: 'Not found', message: 'Comment not found' });
      return;
    }

    const isAuthor = comment.userId === req.user.id;
    const isOwner = (comment as any).trip.userId === req.user.id;

    if (!isAuthor && !isOwner) {
      res.status(403).json({ error: 'Forbidden', message: 'Only the comment author or trip owner can delete this comment' });
      return;
    }

    await prisma.tripComment.delete({ where: { id: commentId } });

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to delete comment' });
  }
};
