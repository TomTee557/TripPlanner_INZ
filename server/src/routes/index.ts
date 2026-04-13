import { Router } from 'express';
import authRoutes from './auth.routes';
import tripsRoutes from './trips.routes';
import adminRoutes from './admin.routes';
import expensesRoutes from './expenses.routes';
import packingRoutes from './packing.routes';
import todosRoutes from './todos.routes';
import participantsRoutes from './participants.routes';

const router = Router();

// Auth routes: /api/auth/*
router.use('/auth', authRoutes);

// Trips routes: /api/trips/*
router.use('/trips', tripsRoutes);

// Admin routes: /api/admin/*
router.use('/admin', adminRoutes);

// Expenses routes: /api/trips/:tripId/expenses/* and /api/expense-categories
router.use('/', expensesRoutes);

// Packing routes: /api/trips/:tripId/packing/* and /api/packing-categories
router.use('/', packingRoutes);

// Todos routes: /api/trips/:tripId/todos/*
router.use('/', todosRoutes);

// Participants routes: /api/users/check-email, /api/trips/:tripId/participants/*
router.use('/', participantsRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

export default router;
