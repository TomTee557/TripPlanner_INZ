import { Router } from 'express';
import { getDocuments, createDocument, deleteDocument, updateDocument, getExpiringSoon } from '../controllers/documents.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/documents/expiring-soon:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Check for expiring documents
 *     description: >
 *       Returns a boolean flag indicating whether the authenticated user has any documents
 *       expiring within their warning threshold.
 *       Passport, ID Card, Visa, Insurance, Vaccination Card, and Driving License get a 6-month window;
 *       all other types get a 30-day window.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expiry check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DocumentsExpiringSoon'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/expiring-soon', getExpiringSoon);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Get all documents for the authenticated user
 *     description: Returns all travel documents ordered by expiration date (ascending).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
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
 *                     $ref: '#/components/schemas/UserDocument'
 *                 count:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getDocuments);

/**
 * @swagger
 * /api/documents:
 *   post:
 *     tags:
 *       - Documents
 *     summary: Add a new document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - expirationDate
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [Passport, ID Card, Visa, Insurance, Vaccination Card, Driving License, Other]
 *                 example: Passport
 *               description:
 *                 type: string
 *                 example: "Passport number AB123456"
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: "2030-05-01"
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserDocument'
 *       400:
 *         description: Validation error (missing required fields)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', createDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     tags:
 *       - Documents
 *     summary: Update an existing document
 *     description: Only the document owner can update it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - expirationDate
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [Passport, ID Card, Visa, Insurance, Vaccination Card, Driving License, Other]
 *                 example: Visa
 *               description:
 *                 type: string
 *                 example: "US tourist visa"
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: "2027-01-15"
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserDocument'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     tags:
 *       - Documents
 *     summary: Delete a document
 *     description: Only the document owner can delete it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteDocument);

export default router;
