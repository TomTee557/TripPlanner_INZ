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

    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
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
      createdAt: trip.createdAt.toISOString()
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
 * Delete trip
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

    // Delete trip
    await prisma.trip.delete({
      where: { id: id }
    });

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to delete trip. Please try again later.'
    });
  }
};
