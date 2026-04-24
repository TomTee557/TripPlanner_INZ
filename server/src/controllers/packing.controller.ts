import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, PackingItemRequest } from '../types';
import { canAccessTrip } from '../utils/tripAccess';

/**
 * GET /api/trips/:tripId/packing
 * Get all packing items for a specific trip
 */
export const getPackingItems = async (
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

    if (!await canAccessTrip(tripId, req.user.id)) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found' });
      return;
    }

    const packingItems = await prisma.packingItem.findMany({
      where: {
        tripId,
        OR: [{ isPrivate: false }, { userId: req.user.id }]
      },
      include: {
        category: true,
        user: {
          select: { id: true, email: true, name: true, surname: true }
        }
      },
      orderBy: [
        { isPacked: 'asc' },
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    const formattedItems = packingItems.map((item: any) => ({
      id: item.id,
      tripId: item.tripId,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      categoryIcon: item.category.icon,
      name: item.name,
      quantity: item.quantity,
      isPacked: item.isPacked,
      priority: item.priority,
      isPrivate: item.isPrivate,
      createdAt: item.createdAt.toISOString(),
      addedBy: item.user ? { id: item.user.id, email: item.user.email, name: item.user.name, surname: item.user.surname } : null
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
      count: formattedItems.length
    });
  } catch (error) {
    console.error('Error fetching packing items:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch packing items'
    });
  }
};

/**
 * POST /api/trips/:tripId/packing
 * Create new packing item
 */
export const createPackingItem = async (
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
    const { categoryId, name, quantity, isPacked, priority, isPrivate }: PackingItemRequest = req.body;

    // Validate required fields
    if (!categoryId || !name) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Category and name are required'
      });
      return;
    }

    if (!await canAccessTrip(tripId, req.user.id)) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found' });
      return;
    }

    const packingItem = await prisma.packingItem.create({
      data: {
        tripId,
        categoryId,
        userId: req.user.id,
        name,
        quantity: quantity || 1,
        isPacked: isPacked || false,
        priority: priority || 'medium',
        isPrivate: isPrivate ?? false
      },
      include: { category: true }
    });

    res.status(201).json({
      success: true,
      message: 'Packing item created successfully',
      data: {
        id: packingItem.id,
        tripId: packingItem.tripId,
        categoryId: packingItem.categoryId,
        categoryName: packingItem.category.name,
        name: packingItem.name,
        quantity: packingItem.quantity,
        isPacked: packingItem.isPacked,
        priority: packingItem.priority
      }
    });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      res.status(404).json({ error: 'Not found', message: 'This trip no longer exists — it may have been deleted by the owner.' });
      return;
    }
    console.error('Error creating packing item:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to create packing item'
    });
  }
};

/**
 * PUT /api/trips/:tripId/packing/:id
 * Update packing item
 */
export const updatePackingItem = async (
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

    const { tripId, id } = req.params;
    const { categoryId, name, quantity, isPacked, priority }: PackingItemRequest = req.body;

    if (!await canAccessTrip(tripId, req.user.id)) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found' });
      return;
    }

    const existingItem = await prisma.packingItem.findFirst({
      where: { id, tripId }
    });

    if (!existingItem) {
      res.status(404).json({
        error: 'Not found',
        message: 'Packing item not found'
      });
      return;
    }

    const updatedItem = await prisma.packingItem.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
        ...(name && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(isPacked !== undefined && { isPacked }),
        ...(priority && { priority }),
        updatedAt: new Date()
      },
      include: { category: true }
    });

    res.status(200).json({
      success: true,
      message: 'Packing item updated successfully',
      data: {
        id: updatedItem.id,
        tripId: updatedItem.tripId,
        categoryId: updatedItem.categoryId,
        categoryName: updatedItem.category.name,
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        isPacked: updatedItem.isPacked,
        priority: updatedItem.priority
      }
    });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      res.status(404).json({ error: 'Not found', message: 'This trip no longer exists — it may have been deleted by the owner.' });
      return;
    }
    console.error('Error updating packing item:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to update packing item'
    });
  }
};

/**
 * DELETE /api/trips/:tripId/packing/:id
 * Delete packing item
 */
export const deletePackingItem = async (
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

    const { tripId, id } = req.params;

    if (!await canAccessTrip(tripId, req.user.id)) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found' });
      return;
    }

    const packingItem = await prisma.packingItem.findFirst({
      where: { id, tripId }
    });

    if (!packingItem) {
      res.status(404).json({
        error: 'Not found',
        message: 'Packing item not found'
      });
      return;
    }

    await prisma.packingItem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Packing item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting packing item:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to delete packing item'
    });
  }
};

/**
 * GET /api/packing-categories
 * Get all packing categories
 */
export const getPackingCategories = async (
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

    const categories = await prisma.packingCategory.findMany({
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching packing categories:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch packing categories'
    });
  }
};
