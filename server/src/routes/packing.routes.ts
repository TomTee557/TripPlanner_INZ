import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getPackingItems,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  getPackingCategories
} from '../controllers/packing.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Packing categories (independent endpoint)
router.get('/packing-categories', getPackingCategories);

// Trip-specific packing routes
router.get('/trips/:tripId/packing', getPackingItems);
router.post('/trips/:tripId/packing', createPackingItem);
router.put('/trips/:tripId/packing/:id', updatePackingItem);
router.delete('/trips/:tripId/packing/:id', deletePackingItem);

export default router;
