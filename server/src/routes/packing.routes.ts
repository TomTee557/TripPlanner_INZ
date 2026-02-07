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

/**
 * @swagger
 * /api/packing-categories:
 *   get:
 *     tags:
 *       - Packing List
 *     summary: Get all packing categories
 *     description: Retrieve list of all available packing item categories
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
 *                         example: Clothing
 *                       icon:
 *                         type: string
 *                         example: tshirt
 *       401:
 *         description: Unauthorized
 */
router.get('/packing-categories', getPackingCategories);

/**
 * @swagger
 * /api/trips/{tripId}/packing:
 *   get:
 *     tags:
 *       - Packing List
 *     summary: Get all packing items for a trip
 *     description: Retrieve all packing items associated with a specific trip
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
 *         description: Packing items retrieved successfully
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
 *                     $ref: '#/components/schemas/PackingItem'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.get('/trips/:tripId/packing', getPackingItems);

/**
 * @swagger
 * /api/trips/{tripId}/packing:
 *   post:
 *     tags:
 *       - Packing List
 *     summary: Create new packing item
 *     description: Add a new item to trip's packing list
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
 *               - name
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: T-shirts
 *               quantity:
 *                 type: integer
 *                 example: 5
 *                 default: 1
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 example: medium
 *                 default: medium
 *               isPacked:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *     responses:
 *       201:
 *         description: Packing item created successfully
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
 *                   example: Packing item created successfully
 *                 data:
 *                   $ref: '#/components/schemas/PackingItem'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/trips/:tripId/packing', createPackingItem);

/**
 * @swagger
 * /api/trips/{tripId}/packing/{id}:
 *   put:
 *     tags:
 *       - Packing List
 *     summary: Update packing item
 *     description: Update an existing packing item or toggle its packed status
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
 *         description: Packing item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: integer
 *               name:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               isPacked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Packing item updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Packing item not found
 */
router.put('/trips/:tripId/packing/:id', updatePackingItem);

/**
 * @swagger
 * /api/trips/{tripId}/packing/{id}:
 *   delete:
 *     tags:
 *       - Packing List
 *     summary: Delete packing item
 *     description: Remove an item from trip's packing list
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
 *         description: Packing item ID
 *     responses:
 *       200:
 *         description: Packing item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Packing item not found
 */
router.delete('/trips/:tripId/packing/:id', deletePackingItem);

export default router;
