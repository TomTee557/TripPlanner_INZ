import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, TripRequest } from '../types';

/**
 * GET /api/trips
 * Get all trips for authenticated user
 */
export const getTrips = async (
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

    // Fetch trips the user owns OR has been accepted as participant
    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          {
            participants: {
              some: { userId: req.user.id, status: 'ACCEPTED' }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, email: true, name: true, surname: true }
            }
          }
        },
        user: {
          select: { id: true, email: true, name: true, surname: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert dates and JSON fields for response
    const formattedTrips = trips.map((trip: any) => ({
      id: trip.id,
      title: trip.title,
      dateFrom: trip.dateFrom.toISOString().split('T')[0],
      dateTo: trip.dateTo.toISOString().split('T')[0],
      country: trip.country,
      tripType: trip.tripType || [],
      tags: trip.tags || [],
      budget: trip.budget,
      description: trip.description,
      image: trip.image,
      createdAt: trip.createdAt.toISOString(),
      isOwner: trip.userId === req.user!.id,
      owner: trip.user ? {
        id: trip.user.id,
        email: trip.user.email,
        name: trip.user.name,
        surname: trip.user.surname
      } : null,
      participants: (trip.participants || []).map((p: any) => ({
        id: p.id,
        userId: p.userId,
        email: p.user.email,
        name: p.user.name,
        surname: p.user.surname,
        status: p.status
      }))
    }));

    res.status(200).json({
      success: true,
      data: formattedTrips,
      user: req.user.email,
      count: formattedTrips.length
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch trips. Please try again later.'
    });
  }
};

/**
 * GET /api/trips/:id
 * Get single trip by ID
 */
export const getTripById = async (
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

    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({
        error: 'Invalid ID',
        message: 'Trip ID must be a valid UUID'
      });
      return;
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id: id,
        userId: req.user.id // Ensure user can only access their own trips
      }
    });

    if (!trip) {
      res.status(404).json({
        error: 'Not found',
        message: 'Trip not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: trip.id,
        title: trip.title,
        dateFrom: trip.dateFrom.toISOString().split('T')[0],
        dateTo: trip.dateTo.toISOString().split('T')[0],
        country: trip.country,
        tripType: trip.tripType || [],
        tags: trip.tags || [],
        budget: trip.budget,
        description: trip.description,
        image: trip.image,
        createdAt: trip.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch trip. Please try again later.'
    });
  }
};

/**
 * POST /api/trips
 * Create new trip
 */
export const createTrip = async (
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

    const tripData = req.body as TripRequest;

    // Validate required fields
    if (!tripData.title || !tripData.country || !tripData.dateFrom || !tripData.dateTo) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, country, dateFrom and dateTo are required'
      });
      return;
    }

    // Extract participant IDs from request body
    const participantIds: number[] = req.body.participants || [];

    // Create trip
    const newTrip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        title: tripData.title.trim(),
        country: tripData.country.trim(),
        dateFrom: new Date(tripData.dateFrom),
        dateTo: new Date(tripData.dateTo),
        tripType: tripData.tripType || [],
        tags: tripData.tags || [],
        budget: tripData.budget?.trim() || null,
        description: tripData.description?.trim() || null,
        image: tripData.image || '/public/assets/mountains.jpg'
      }
    });

    // Create participant records if any
    if (participantIds.length > 0) {
      const participantData = participantIds.map((userId: number) => ({
        tripId: newTrip.id,
        userId,
        status: 'PENDING'
      }));

      await prisma.tripParticipant.createMany({
        data: participantData,
        skipDuplicates: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Trip added successfully',
      tripId: newTrip.id,
      user: req.user.email
    });
  } catch (error) {
    console.error('Error adding trip:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to add trip. Please try again later.'
    });
  }
};

/**
 * PUT /api/trips/:id
 * Update existing trip
 */
export const updateTrip = async (
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

    const { id } = req.params;
    const tripData = req.body as TripRequest;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({
        error: 'Invalid ID',
        message: 'Trip ID must be a valid UUID'
      });
      return;
    }

    // Validate required fields
    if (!tripData.title || !tripData.country || !tripData.dateFrom || !tripData.dateTo) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, country, dateFrom and dateTo are required'
      });
      return;
    }

    // Check if trip exists and belongs to user
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    if (!existingTrip) {
      res.status(404).json({
        error: 'Not found',
        message: 'Trip not found or access denied'
      });
      return;
    }

    // Update trip
    await prisma.trip.update({
      where: { id: id },
      data: {
        title: tripData.title.trim(),
        country: tripData.country.trim(),
        dateFrom: new Date(tripData.dateFrom),
        dateTo: new Date(tripData.dateTo),
        tripType: tripData.tripType || [],
        tags: tripData.tags || [],
        budget: tripData.budget?.trim() || null,
        description: tripData.description?.trim() || null,
        image: tripData.image || '/public/assets/mountains.jpg'
      }
    });

    // Add new participants if provided
    const participantIds: number[] = req.body.participants || [];
    if (participantIds.length > 0) {
      // Find already existing participant IDs for this trip to avoid duplicates
      const existing = await prisma.tripParticipant.findMany({
        where: { tripId: id },
        select: { userId: true }
      });
      const existingIds = new Set(existing.map((p: any) => p.userId));

      const newParticipants = participantIds
        .filter((uid: number) => uid !== req.user!.id && !existingIds.has(uid))
        .map((uid: number) => ({ tripId: id, userId: uid, status: 'PENDING' }));

      if (newParticipants.length > 0) {
        await prisma.tripParticipant.createMany({ data: newParticipants, skipDuplicates: true });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      tripId: id
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to update trip. Please try again later.'
    });
  }
};

/**
 * DELETE /api/trips/:id
 * Delete trip (owner) or leave trip (participant)
 */
export const deleteTrip = async (
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

    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({
        error: 'Invalid ID',
        message: 'Trip ID must be a valid UUID'
      });
      return;
    }

    // Check if user is the owner
    const ownedTrip = await prisma.trip.findFirst({
      where: { id, userId: req.user.id },
      include: {
        participants: {
          where: { status: 'ACCEPTED' },
          include: { user: { select: { id: true, name: true, surname: true } } }
        }
      }
    });

    if (ownedTrip) {
      // Owner deleting — notify all accepted participants, then cascade delete
      if (ownedTrip.participants.length > 0) {
        await prisma.notification.createMany({
          data: ownedTrip.participants.map((p: any) => ({
            userId: p.userId,
            type: 'TRIP_DELETED',
            message: `Trip "${ownedTrip.title}" has been deleted by the owner.`
          }))
        });
      }

      await prisma.trip.delete({ where: { id } });

      res.status(200).json({ success: true, message: 'Trip deleted successfully' });
      return;
    }

    // Check if user is an accepted participant
    const participation = await prisma.tripParticipant.findFirst({
      where: { tripId: id, userId: req.user.id, status: 'ACCEPTED' },
      include: {
        trip: { select: { title: true } }
      }
    });

    if (!participation) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found or access denied' });
      return;
    }

    // Participant leaving — delete their data, set status to LEFT
    await prisma.$transaction([
      prisma.expense.deleteMany({ where: { tripId: id, userId: req.user.id } }),
      prisma.packingItem.deleteMany({ where: { tripId: id, userId: req.user.id } }),
      prisma.todoItem.deleteMany({ where: { tripId: id, userId: req.user.id } }),
      prisma.tripParticipant.update({
        where: { id: participation.id },
        data: { status: 'LEFT', ownerSeen: false }
      })
    ]);

    res.status(200).json({ success: true, message: 'You have left the trip' });
  } catch (error) {
    console.error('Error deleting/leaving trip:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to process request. Please try again later.'
    });
  }
};

/**
 * PUT /api/trips/:id/transfer-owner
 * Transfer trip ownership to an accepted participant.
 * The current owner's participant record is removed (they leave the trip).
 * Only the current owner can call this endpoint.
 */
export const transferOwner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { newOwnerId } = req.body as { newOwnerId?: number };

    if (!newOwnerId || typeof newOwnerId !== 'number') {
      res.status(400).json({ error: 'Validation error', message: 'newOwnerId is required' });
      return;
    }

    // Verify caller is the current owner
    const trip = await prisma.trip.findFirst({
      where: { id, userId: req.user.id },
      include: {
        participants: {
          where: { userId: newOwnerId, status: 'ACCEPTED' }
        }
      }
    });

    if (!trip) {
      res.status(403).json({ error: 'Forbidden', message: 'Only the trip owner can transfer ownership' });
      return;
    }

    // New owner must be an accepted participant
    if (trip.participants.length === 0) {
      res.status(400).json({ error: 'Validation error', message: 'The selected user is not an accepted participant of this trip' });
      return;
    }

    // Cannot transfer to yourself
    if (newOwnerId === req.user.id) {
      res.status(400).json({ error: 'Validation error', message: 'You are already the owner' });
      return;
    }

    const participantRecord = trip.participants[0];

    // Atomically: update trip owner + remove the new owner's participant record + remove old owner's participant record (if any)
    await prisma.$transaction([
      // Set new owner on trip
      prisma.trip.update({
        where: { id },
        data: { userId: newOwnerId }
      }),
      // Remove new owner's participant entry (they are now the owner, not a participant)
      prisma.tripParticipant.delete({
        where: { id: participantRecord.id }
      }),
      // Remove old owner's participant entry if it exists (clean up any stale record)
      prisma.tripParticipant.deleteMany({
        where: { tripId: id, userId: req.user.id }
      })
    ]);

    res.status(200).json({ success: true, message: 'Ownership transferred successfully' });
  } catch (error) {
    console.error('Error transferring trip ownership:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to transfer ownership' });
  }
};
