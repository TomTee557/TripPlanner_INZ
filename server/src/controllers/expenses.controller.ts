import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, ExpenseRequest } from '../types';
import { canAccessTrip } from '../utils/tripAccess';

/**
 * GET /api/trips/:tripId/expenses
 * Get all expenses for a specific trip
 */
export const getExpenses = async (
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

    const expenses = await prisma.expense.findMany({
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
      orderBy: { expenseDate: 'desc' }
    });

    const formattedExpenses = expenses.map((expense: any) => ({
      id: expense.id,
      tripId: expense.tripId,
      categoryId: expense.categoryId,
      categoryName: expense.category.name,
      categoryIcon: expense.category.icon,
      categoryColor: expense.category.color,
      amount: expense.amount.toNumber(),
      currency: expense.currency,
      description: expense.description,
      expenseDate: expense.expenseDate.toISOString().split('T')[0],
      isPrivate: expense.isPrivate,
      createdAt: expense.createdAt.toISOString(),
      addedBy: expense.user ? { id: expense.user.id, email: expense.user.email, name: expense.user.name, surname: expense.user.surname } : null
    }));

    res.status(200).json({
      success: true,
      data: formattedExpenses,
      count: formattedExpenses.length
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch expenses'
    });
  }
};

/**
 * GET /api/trips/:tripId/expenses/:id
 * Get single expense by ID
 */
export const getExpenseById = async (
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

    const expense = await prisma.expense.findFirst({
      where: { id, tripId },
      include: { category: true }
    });

    if (!expense) {
      res.status(404).json({
        error: 'Not found',
        message: 'Expense not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: expense.id,
        tripId: expense.tripId,
        categoryId: expense.categoryId,
        categoryName: expense.category.name,
        amount: expense.amount.toNumber(),
        currency: expense.currency,
        description: expense.description,
        expenseDate: expense.expenseDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch expense'
    });
  }
};

/**
 * POST /api/trips/:tripId/expenses
 * Create new expense
 */
export const createExpense = async (
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
    const { categoryId, amount, currency, description, expenseDate, isPrivate }: ExpenseRequest = req.body;

    // Validate required fields
    if (!categoryId || !amount || !expenseDate) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Category, amount, and expense date are required'
      });
      return;
    }

    if (!await canAccessTrip(tripId, req.user.id)) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found' });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        tripId,
        categoryId,
        userId: req.user.id,
        amount,
        currency: currency || 'USD',
        description,
        expenseDate: new Date(expenseDate),
        isPrivate: isPrivate ?? false
      },
      include: { category: true }
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        id: expense.id,
        tripId: expense.tripId,
        categoryId: expense.categoryId,
        categoryName: expense.category.name,
        amount: expense.amount.toNumber(),
        currency: expense.currency,
        description: expense.description,
        expenseDate: expense.expenseDate.toISOString().split('T')[0],
        isPrivate: expense.isPrivate
      }
    });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      res.status(404).json({ error: 'Not found', message: 'This trip no longer exists — it may have been deleted by the owner.' });
      return;
    }
    console.error('Error creating expense:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to create expense'
    });
  }
};

/**
 * PUT /api/trips/:tripId/expenses/:id
 * Update expense
 */
export const updateExpense = async (
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
    const { categoryId, amount, currency, description, expenseDate }: ExpenseRequest = req.body;

    if (!await canAccessTrip(tripId, req.user.id)) {
      res.status(404).json({ error: 'Not found', message: 'Trip not found' });
      return;
    }

    // Check if expense exists
    const existingExpense = await prisma.expense.findFirst({
      where: { id, tripId }
    });

    if (!existingExpense) {
      res.status(404).json({
        error: 'Not found',
        message: 'Expense not found'
      });
      return;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
        ...(amount && { amount }),
        ...(currency && { currency }),
        ...(description !== undefined && { description }),
        ...(expenseDate && { expenseDate: new Date(expenseDate) }),
        updatedAt: new Date()
      },
      include: { category: true }
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: {
        id: updatedExpense.id,
        tripId: updatedExpense.tripId,
        categoryId: updatedExpense.categoryId,
        categoryName: updatedExpense.category.name,
        amount: updatedExpense.amount.toNumber(),
        currency: updatedExpense.currency,
        description: updatedExpense.description,
        expenseDate: updatedExpense.expenseDate.toISOString().split('T')[0]
      }
    });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      res.status(404).json({ error: 'Not found', message: 'This trip no longer exists — it may have been deleted by the owner.' });
      return;
    }
    console.error('Error updating expense:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to update expense'
    });
  }
};

/**
 * DELETE /api/trips/:tripId/expenses/:id
 * Delete expense
 */
export const deleteExpense = async (
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

    const expense = await prisma.expense.findFirst({
      where: { id, tripId }
    });

    if (!expense) {
      res.status(404).json({
        error: 'Not found',
        message: 'Expense not found'
      });
      return;
    }

    await prisma.expense.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to delete expense'
    });
  }
};

/**
 * GET /api/expense-categories
 * Get all expense categories
 */
export const getExpenseCategories = async (
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

    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Unable to fetch expense categories'
    });
  }
};
