import { Router } from 'express';
import InterestController from '../controllers/InterestController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', InterestController.getCategories);
router.post('/', authenticateToken, requireAdmin, InterestController.createCategory);

export default router;
