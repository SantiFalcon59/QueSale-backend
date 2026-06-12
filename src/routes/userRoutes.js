import express from 'express';
import UserController from '../controllers/UserController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { paginationMiddleware, handleValidationErrors } from '../middleware/validators.js';
import { body, param } from 'express-validator';

const router = express.Router();

/**
 * @route   GET /users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, UserController.getProfile);

/**
 * @route   GET /users/admin-organizations
 * @desc    Get organizations where user is admin
 * @access  Private
 */
router.get('/admin-organizations', authenticateToken, UserController.getAdminOrganizations);

/**
 * @route   PUT /users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9._]+$/)
      .withMessage('Username must be 3-20 characters and contain only letters, numbers, dots, or underscores'),
    body('email').optional().isEmail(),
    body('description').optional().isLength({ max: 1000 }),
    body('photo_url').optional().isString(),
  ],
  handleValidationErrors,
  UserController.updateProfile
);

/**
 * @route   POST /users/interests
 * @desc    Set user interests
 * @access  Private
 */
router.post(
  '/interests',
  authenticateToken,
  [body('interestIds').isArray()],
  handleValidationErrors,
  UserController.setInterests
);

/**
 * @route   GET /users/saved-events
 * @desc    Get saved events
 * @access  Private
 */
router.get('/saved-events', authenticateToken, paginationMiddleware, UserController.getSavedEvents);

/**
 * @route   POST /users/saved-events/:eventId
 * @desc    Save an event
 * @access  Private
 */
router.post('/saved-events/:eventId', authenticateToken, UserController.saveEvent);

/**
 * @route   DELETE /users/saved-events/:eventId
 * @desc    Unsave an event
 * @access  Private
 */
router.delete('/saved-events/:eventId', authenticateToken, UserController.unsaveEvent);

/**
 * @route   GET /users
 * @desc    Get users list (admin)
 * @access  Private
 */
router.get('/', authenticateToken, requireAdmin, paginationMiddleware, UserController.getUsers);

/**
 * @route   PUT /users/:userId/role
 * @desc    Update user global role (admin only)
 * @access  Private
 */
router.put(
  '/:userId/role',
  authenticateToken,
  requireAdmin,
  [
    param('userId').isString().notEmpty(),
    body('role').isIn(['admin', 'moderator', 'user']).withMessage('Invalid role'),
  ],
  handleValidationErrors,
  UserController.updateGlobalRole
);

/**
 * @route   GET /users/:userId/profile
 * @desc    Get public user profile
 * @access  Public
 */
router.get('/username/:username/profile', UserController.getPublicProfileByUsername);
router.get('/:userId/profile', UserController.getPublicProfile);

/**
 * @route   GET /users/:userId/wall
 * @desc    Get public wall posts for a user
 * @access  Public
 */
router.get('/:userId/wall', paginationMiddleware, UserController.getWall);

/**
 * @route   POST /users/:userId/wall
 * @desc    Create a wall post
 * @access  Private
 */
router.post(
  '/:userId/wall',
  authenticateToken,
  [body('content').trim().notEmpty().isLength({ max: 2000 })],
  handleValidationErrors,
  UserController.createWallPost
);

/**
 * @route   DELETE /users/wall/:postId
 * @desc    Delete a wall post
 * @access  Private
 */
router.delete('/wall/:postId', authenticateToken, UserController.deleteWallPost);

/**
 * @route   POST /users/wall/:postId/like
 * @desc    Toggle like on a wall post
 * @access  Private
 */
router.post('/wall/:postId/like', authenticateToken, UserController.toggleWallPostLike);

/**
 * @route   POST /users/wall/:postId/comments
 * @desc    Create a comment on a wall post
 * @access  Private
 */
router.post(
  '/wall/:postId/comments',
  authenticateToken,
  [body('content').trim().notEmpty().isLength({ max: 1000 })],
  handleValidationErrors,
  UserController.createWallComment
);

/**
 * @route   DELETE /users/wall/comments/:commentId
 * @desc    Delete a wall comment
 * @access  Private
 */
router.delete('/wall/comments/:commentId', authenticateToken, UserController.deleteWallComment);

/**
 * @route   POST /users/wall/comments/:commentId/like
 * @desc    Toggle like on a wall comment
 * @access  Private
 */
router.post('/wall/comments/:commentId/like', authenticateToken, UserController.toggleWallCommentLike);

/**
 * @route   POST /users/profile/instagram/start
 * @desc    Start Instagram link flow
 * @access  Private
 */
router.post(
  '/profile/instagram/start',
  authenticateToken,
  [body('instagram').trim().notEmpty().isLength({ max: 100 })],
  handleValidationErrors,
  UserController.startInstagramLink
);

/**
 * @route   POST /users/profile/instagram/verify
 * @desc    Verify Instagram link
 * @access  Private
 */
router.post(
  '/profile/instagram/verify',
  authenticateToken,
  [body('code').trim().notEmpty().isLength({ max: 16 })],
  handleValidationErrors,
  UserController.verifyInstagramLink
);

export default router;
