import { Router } from 'express';
import { create, list, getById, restore } from '../controllers/version.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:vid', getById);
router.post('/:vid/restore', restore);

export default router;
