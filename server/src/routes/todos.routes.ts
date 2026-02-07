import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem
} from '../controllers/todos.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/trips/{tripId}/todos:
 *   get:
 *     tags:
 *       - Todos
 *     summary: Get all todo items for a trip
 *     description: Retrieve all todo items associated with a specific trip
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
 *         description: Todo items retrieved successfully
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
 *                     $ref: '#/components/schemas/TodoItem'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.get('/trips/:tripId/todos', getTodoItems);

/**
 * @swagger
 * /api/trips/{tripId}/todos:
 *   post:
 *     tags:
 *       - Todos
 *     summary: Create new todo item
 *     description: Add a new task to trip's todo list
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
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Book hotel
 *               description:
 *                 type: string
 *                 example: Find and book accommodation near city center
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 example: high
 *                 default: medium
 *               isCompleted:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-06-15
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Todo item created successfully
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
 *                   example: Todo item created successfully
 *                 data:
 *                   $ref: '#/components/schemas/TodoItem'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/trips/:tripId/todos', createTodoItem);

/**
 * @swagger
 * /api/trips/{tripId}/todos/{id}:
 *   put:
 *     tags:
 *       - Todos
 *     summary: Update todo item
 *     description: Update an existing todo item or toggle its completion status
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
 *         description: Todo item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               isCompleted:
 *                 type: boolean
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Todo item updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo item not found
 */
router.put('/trips/:tripId/todos/:id', updateTodoItem);

/**
 * @swagger
 * /api/trips/{tripId}/todos/{id}:
 *   delete:
 *     tags:
 *       - Todos
 *     summary: Delete todo item
 *     description: Remove a task from trip's todo list
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
 *         description: Todo item ID
 *     responses:
 *       200:
 *         description: Todo item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo item not found
 */
router.delete('/trips/:tripId/todos/:id', deleteTodoItem);

export default router;
