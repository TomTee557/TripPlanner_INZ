import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, TodoItemRequest } from '../types';

/**
 * GET /api/trips/:tripId/todos
 * Get all todo items for a specific trip
 */
export const getTodoItems = async (
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

    const todoItems = await prisma.todoItem.findMany({
      where: { tripId },
      include: {
        user: {
          select: { id: true, email: true, name: true, surname: true }
        }
      },
      orderBy: [
        { isCompleted: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });

    const formattedItems = todoItems.map((item: any) => ({
      id: item.id,
      tripId: item.tripId,
      title: item.title,
      description: item.description,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : null,
      isCompleted: item.isCompleted,
      priority: item.priority,
      createdAt: item.createdAt.toISOString(),
      addedBy: item.user ? { id: item.user.id, email: item.user.email, name: item.user.name, surname: item.user.surname } : null
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
      count: formattedItems.length
    });
  } catch (error) {
    console.error('Error fetching todo items:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch todo items'
    });
  }
};

/**
 * POST /api/trips/:tripId/todos
 * Create new todo item
 */
export const createTodoItem = async (
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
    const { title, description, dueDate, isCompleted, priority }: TodoItemRequest = req.body;

    // Validate required fields
    if (!title) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Title is required'
      });
      return;
    }

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

    const todoItem = await prisma.todoItem.create({
      data: {
        tripId,
        userId: req.user.id,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted: isCompleted || false,
        priority: priority || 'medium'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Todo item created successfully',
      data: {
        id: todoItem.id,
        tripId: todoItem.tripId,
        title: todoItem.title,
        description: todoItem.description,
        dueDate: todoItem.dueDate ? todoItem.dueDate.toISOString().split('T')[0] : null,
        isCompleted: todoItem.isCompleted,
        priority: todoItem.priority
      }
    });
  } catch (error) {
    console.error('Error creating todo item:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to create todo item'
    });
  }
};

/**
 * PUT /api/trips/:tripId/todos/:id
 * Update todo item
 */
export const updateTodoItem = async (
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
    const { title, description, dueDate, isCompleted, priority }: TodoItemRequest = req.body;

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

    const existingItem = await prisma.todoItem.findFirst({
      where: { id, tripId }
    });

    if (!existingItem) {
      res.status(404).json({
        error: 'Not found',
        message: 'Todo item not found'
      });
      return;
    }

    const updatedItem = await prisma.todoItem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(priority && { priority }),
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Todo item updated successfully',
      data: {
        id: updatedItem.id,
        tripId: updatedItem.tripId,
        title: updatedItem.title,
        description: updatedItem.description,
        dueDate: updatedItem.dueDate ? updatedItem.dueDate.toISOString().split('T')[0] : null,
        isCompleted: updatedItem.isCompleted,
        priority: updatedItem.priority
      }
    });
  } catch (error) {
    console.error('Error updating todo item:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to update todo item'
    });
  }
};

/**
 * DELETE /api/trips/:tripId/todos/:id
 * Delete todo item
 */
export const deleteTodoItem = async (
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

    const todoItem = await prisma.todoItem.findFirst({
      where: { id, tripId }
    });

    if (!todoItem) {
      res.status(404).json({
        error: 'Not found',
        message: 'Todo item not found'
      });
      return;
    }

    await prisma.todoItem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Todo item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting todo item:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to delete todo item'
    });
  }
};
