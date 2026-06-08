import express from 'express';
import WallController from '../controllers/WallController.js';
import { authenticateToken } from '../middleware/auth.js';
import { paginationMiddleware, handleValidationErrors } from '../middleware/validators.js';
import { body } from 'express-validator';

const router = express.Router();

router.get('/:wallType/:wallId', paginationMiddleware, WallController.getPosts);

router.post(
  '/:wallType/:wallId',
  authenticateToken,
  [body('content').trim().notEmpty().isLength({ max: 2000 })],
  handleValidationErrors,
  WallController.createPost
);

router.delete('/post/:postId', authenticateToken, WallController.deletePost);

router.post(
  '/post/:postId/comments',
  authenticateToken,
  [body('content').trim().notEmpty().isLength({ max: 1000 })],
  handleValidationErrors,
  WallController.createComment
);

router.delete('/post/:postId/comments/:commentId', authenticateToken, WallController.deleteComment);

router.post('/post/:postId/reaction', authenticateToken, WallController.toggleReaction);

export default router;
