import { Router } from 'express';
import { getDocuments, createDocument, deleteDocument } from '../controllers/documents.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getDocuments);
router.post('/', createDocument);
router.delete('/:id', deleteDocument);

export default router;
