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

// Trip-specific todo routes
router.get('/trips/:tripId/todos', getTodoItems);
router.post('/trips/:tripId/todos', createTodoItem);
router.put('/trips/:tripId/todos/:id', updateTodoItem);
router.delete('/trips/:tripId/todos/:id', deleteTodoItem);

export default router;
