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

/**
 * @swagger
 * /api/expense-categories:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get all expense categories
 *     description: Retrieve list of all available expense categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Accommodation
 *                       icon:
 *                         type: string
 *                         example: hotel
 *       401:
 *         description: Unauthorized
 */
router.get('/expense-categories', getExpenseCategories);

/**
 * @swagger
 * /api/trips/{tripId}/expenses:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get all expenses for a trip
 *     description: Retrieve all expenses associated with a specific trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.get('/trips/:tripId/expenses', getExpenses);

/**
 * @swagger
 * /api/trips/{tripId}/expenses/{id}:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get expense by ID
 *     description: Retrieve a single expense by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */
router.get('/trips/:tripId/expenses/:id', getExpenseById);

/**
 * @swagger
 * /api/trips/{tripId}/expenses:
 *   post:
 *     tags:
 *       - Expenses
 *     summary: Create new expense
 *     description: Add a new expense to a trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - amount
 *               - expenseDate
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 45.50
 *               currency:
 *                 type: string
 *                 example: USD
 *                 default: USD
 *               description:
 *                 type: string
 *                 example: Dinner at restaurant
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-07-05
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Expense created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/trips/:tripId/expenses', createExpense);

/**
 * @swagger
 * /api/trips/{tripId}/expenses/{id}:
 *   put:
 *     tags:
 *       - Expenses
 *     summary: Update expense
 *     description: Update an existing expense
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *               description:
 *                 type: string
 *               expenseDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */
router.put('/trips/:tripId/expenses/:id', updateExpense);

/**
 * @swagger
 * /api/trips/{tripId}/expenses/{id}:
 *   delete:
 *     tags:
 *       - Expenses
 *     summary: Delete expense
 *     description: Remove an expense from a trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */
router.delete('/trips/:tripId/expenses/:id', deleteExpense);

export default router;
