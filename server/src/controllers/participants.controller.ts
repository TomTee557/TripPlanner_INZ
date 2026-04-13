import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

/**
 * POST /api/users/check-email
 * Check if a user exists by email (for adding participants)
 */
export const checkUserByEmail = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'Authentication required'
      });
      return;
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email is required'
      });
      return;
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Prevent adding yourself
    if (trimmedEmail === req.user.email.toLowerCase()) {
      res.status(400).json({
        error: 'Validation error',
        message: 'You cannot add yourself as a participant'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true
      }
    });

    if (!user) {
      res.status(404).json({
        error: 'Not found',
        message: 'User does not exist'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error checking user by email:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to check user. Please try again later.'
    });
  }
};

/**
 * GET /api/trips/:tripId/participants
 * Get all participants for a trip
 */
export const getParticipants = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'Authentication required'
      });
      return;
    }

    const { tripId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.user.id }
    });

    if (!trip) {
      res.status(404).json({
        error: 'Not found',
        message: 'Trip not found'
      });
      return;
    }

    const participants = await prisma.tripParticipant.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            surname: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedParticipants = participants.map((p: any) => ({
      id: p.id,
      tripId: p.tripId,
      userId: p.userId,
      email: p.user.email,
      name: p.user.name,
      surname: p.user.surname,
      status: p.status,
      createdAt: p.createdAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: formattedParticipants,
      count: formattedParticipants.length
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch participants'
    });
  }
};

/**
 * DELETE /api/trips/:tripId/participants/:participantId
 * Remove a participant from a trip
 */
export const removeParticipant = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'Authentication required'
      });
      return;
    }

    const { tripId, participantId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.user.id }
    });

    if (!trip) {
      res.status(404).json({
        error: 'Not found',
        message: 'Trip not found'
      });
      return;
    }

    const participant = await prisma.tripParticipant.findFirst({
      where: { id: participantId, tripId }
    });

    if (!participant) {
      res.status(404).json({
        error: 'Not found',
        message: 'Participant not found'
      });
      return;
    }

    await prisma.tripParticipant.delete({
      where: { id: participantId }
    });

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to remove participant'
    });
  }
};
