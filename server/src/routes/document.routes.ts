import { Router } from 'express';
import { create, list, getById, update, remove } from '../controllers/document.controller';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { createDocumentSchema, updateDocumentSchema } from '../schemas/document.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', validate(createDocumentSchema), create);
router.get('/:id', getById);
router.put('/:id', validate(updateDocumentSchema), update);
router.delete('/:id', remove);

export default router;
