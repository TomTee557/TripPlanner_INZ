import { Router } from 'express';
import authRoutes from './auth.routes';
import tripsRoutes from './trips.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Auth routes: /api/auth/*
router.use('/auth', authRoutes);

// Trips routes: /api/trips/*
router.use('/trips', tripsRoutes);

// Admin routes: /api/admin/*
router.use('/admin', adminRoutes);

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
