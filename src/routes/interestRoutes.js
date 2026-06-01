import { Router } from 'express';
import InterestController from '../controllers/InterestController.js';

const router = Router();

router.get('/', InterestController.getCategories);
router.post('/', InterestController.createCategory);

export default router;
