import { Router } from 'express';
import { generateSmartPacking } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/ai/smart-packing:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate smart packing suggestions
 *     description: |
 *       Uses OpenAI GPT to generate a personalised packing list, to-do list,
 *       estimated expenses, and a trip note based on trip details and optional
 *       context questions. Requires the **SMART_PACKING** permission.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [country, dateFrom, dateTo]
 *             properties:
 *               title: { type: string, example: "Summer in Greece" }
 *               country: { type: string, example: "Greece" }
 *               dateFrom: { type: string, format: date, example: "2025-07-10" }
 *               dateTo: { type: string, format: date, example: "2025-07-20" }
 *               tripType: { type: array, items: { type: string } }
 *               budget: { type: string, example: "€2000" }
 *               activities:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["beach", "city sightseeing"]
 *               climate: { type: string, example: "hot and sunny" }
 *               accommodation: { type: string, example: "hotel" }
 *               transportModes:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["plane", "public transport"]
 *               groupSize: { type: integer, example: 2 }
 *               specialNeeds: { type: string, example: "vegetarian diet" }
 *               language: { type: string, enum: [en, pl], default: en }
 *     responses:
 *       200:
 *         description: Suggestions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     packingItems:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/AiPackingItem' }
 *                     todoItems:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/AiTodoItem' }
 *                     expenses:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/AiExpenseItem' }
 *                     note: { type: string }
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Missing SMART_PACKING permission
 *       429:
 *         description: AI rate limit exceeded
 *       500:
 *         description: AI or server error
 */
router.post('/smart-packing', generateSmartPacking);

export default router;
