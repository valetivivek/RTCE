import { Router } from 'express';
import { add, list, update, remove } from '../controllers/member.controller';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { addMemberSchema, updateMemberSchema } from '../schemas/member.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', list);
router.post('/', validate(addMemberSchema), add);
router.put('/:memberId', validate(updateMemberSchema), update);
router.delete('/:memberId', remove);

export default router;
