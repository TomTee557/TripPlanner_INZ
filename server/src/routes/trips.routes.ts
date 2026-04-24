import { Router } from 'express';
import { getTrips, getTripById, createTrip, updateTrip, deleteTrip, transferOwner } from '../controllers/trips.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All trips routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/trips:
 *   get:
 *     tags:
 *       - Trips
 *     summary: Get all trips
 *     description: Retrieve all trips for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips retrieved successfully
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
 *                     $ref: '#/components/schemas/Trip'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     tags:
 *       - Trips
 *     summary: Get trip by ID
 *     description: Retrieve a single trip by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getTripById);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     tags:
 *       - Trips
 *     summary: Create new trip
 *     description: Create a new trip for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - destination
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Summer Vacation 2024
 *               destination:
 *                 type: string
 *                 example: Paris, France
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-07-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-07-15
 *               description:
 *                 type: string
 *                 example: Two weeks exploring the city of lights
 *               tripType:
 *                 type: string
 *                 enum: [business, leisure, adventure, beach, mountain, city, cultural, safari, cruise, road-trip, family, backpacking, luxury, budget]
 *                 example: leisure
 *               budget:
 *                 type: number
 *                 example: 2500
 *               picture:
 *                 type: string
 *                 example: beach.jpg
 *     responses:
 *       201:
 *         description: Trip created successfully
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
 *                   example: Trip created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', createTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     tags:
 *       - Trips
 *     summary: Update trip
 *     description: Update an existing trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *               destination:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               tripType:
 *                 type: string
 *               budget:
 *                 type: number
 *               picture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     tags:
 *       - Trips
 *     summary: Delete trip
 *     description: Delete a trip and all associated data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteTrip);

/**
 * @swagger
 * /api/trips/{id}/transfer-owner:
 *   put:
 *     tags:
 *       - Trips
 *     summary: Transfer trip ownership to an accepted participant
 *     description: Only the current owner can call this. The new owner must be an ACCEPTED participant. After transfer the old owner is removed from the trip.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newOwnerId]
 *             properties:
 *               newOwnerId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 *       400:
 *         description: Validation error (not a participant, same user, missing field)
 *       403:
 *         description: Caller is not the trip owner
 *       500:
 *         description: Internal server error
 */
router.put('/:id/transfer-owner', transferOwner);

export default router;
