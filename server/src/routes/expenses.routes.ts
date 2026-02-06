import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories
} from '../controllers/expenses.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Expense categories (independent endpoint)
router.get('/expense-categories', getExpenseCategories);

// Trip-specific expense routes
router.get('/trips/:tripId/expenses', getExpenses);
router.get('/trips/:tripId/expenses/:id', getExpenseById);
router.post('/trips/:tripId/expenses', createExpense);
router.put('/trips/:tripId/expenses/:id', updateExpense);
router.delete('/trips/:tripId/expenses/:id', deleteExpense);

export default router;
