import express from 'express';
import EventController from '../controllers/EventController.js';
import EventPostController from '../controllers/EventPostController.js';
import ModeratorController from '../controllers/ModeratorController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { paginationMiddleware, handleValidationErrors } from '../middleware/validators.js';
import { body } from 'express-validator';

const router = express.Router();

/**
 * @route   GET /events
 * @desc    Get all events with pagination and filters
 * @access  Public
 */
router.get(
  '/',
  optionalAuthenticateToken,
  paginationMiddleware,
  EventController.getEvents
);

/**
 * @route   GET /events/nearby
 * @desc    Get nearby events
 * @access  Public
 */
router.get(
  '/nearby',
  optionalAuthenticateToken,
  paginationMiddleware,
  EventController.getNearbyEvents
);

/**
 * @route   POST /events
 * @desc    Create new event
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('date').isISO8601(),
    body('location').notEmpty().trim(),
    body('organizerId').notEmpty(),
    body('interestIds').optional().isArray(),
  ],
  handleValidationErrors,
  EventController.createEvent
);

/**
 * @route   GET /events/search
 * @desc    Search events
 * @access  Public
 */
router.get(
  '/search',
  optionalAuthenticateToken,
  paginationMiddleware,
  EventController.searchEvents
);

/**
 * @route   GET /events/:eventId
 * @desc    Get event details
 * @access  Public
 */
router.get('/:eventId', optionalAuthenticateToken, EventController.getEventDetails);

/**
 * @route   GET /events/:eventId/posts
 * @desc    Get event wall posts or announcements
 * @access  Public
 */
router.get(
  '/:eventId/posts',
  paginationMiddleware,
  EventPostController.getEventPosts
);

/**
 * @route   POST /events/:eventId/posts
 * @desc    Create event wall post or announcement
 * @access  Private
 */
router.post(
  '/:eventId/posts',
  authenticateToken,
  [body('content').trim().notEmpty().isLength({ max: 2000 })],
  handleValidationErrors,
  EventPostController.createEventPost
);

/**
 * @route   DELETE /events/posts/:postId
 * @desc    Delete event post
 * @access  Private
 */
router.delete('/posts/:postId', authenticateToken, EventPostController.deleteEventPost);

/**
 * @route   POST /events/posts/:postId/like
 * @desc    Toggle like on event post
 * @access  Private
 */
router.post('/posts/:postId/like', authenticateToken, EventPostController.togglePostLike);

/**
 * @route   POST /events/posts/:postId/comments
 * @desc    Create event comment
 * @access  Private
 */
router.post(
  '/posts/:postId/comments',
  authenticateToken,
  [body('content').trim().notEmpty().isLength({ max: 1000 })],
  handleValidationErrors,
  EventPostController.createEventComment
);

/**
 * @route   DELETE /events/posts/comments/:commentId
 * @desc    Delete event comment
 * @access  Private
 */
router.delete('/posts/comments/:commentId', authenticateToken, EventPostController.deleteEventComment);

/**
 * @route   POST /events/posts/comments/:commentId/like
 * @desc    Toggle like on event comment
 * @access  Private
 */
router.post('/posts/comments/:commentId/like', authenticateToken, EventPostController.toggleCommentLike);

/**
 * @route   PUT /events/:eventId
 * @desc    Update event
 * @access  Private
 */
router.put(
  '/:eventId',
  authenticateToken,
  [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('date').optional().isISO8601(),
    body('location').optional().trim(),
  ],
  handleValidationErrors,
  EventController.updateEvent
);

/**
 * @route   DELETE /events/:eventId
 * @desc    Delete event
 * @access  Private
 */
router.delete('/:eventId', authenticateToken, EventController.deleteEvent);

/**
 * @route   GET /events/:eventId/moderator-status
 * @desc    Check if current user is moderator/organizer for this event
 * @access  Private
 */
router.get('/:eventId/moderator-status', authenticateToken, EventController.getModeratorStatus);

// --- Moderator routes ---

/**
 * @route   POST /events/:eventId/block
 * @desc    Block a user from event chat/wall
 * @access  Private (organizer/moderator)
 */
router.post(
  '/:eventId/block',
  authenticateToken,
  [body('userId').notEmpty().trim(), body('reason').optional().trim()],
  handleValidationErrors,
  ModeratorController.blockUser
);

/**
 * @route   DELETE /events/:eventId/block/:userId
 * @desc    Unblock a user from event
 * @access  Private (organizer/moderator)
 */
router.delete('/:eventId/block/:userId', authenticateToken, ModeratorController.unblockUser);

/**
 * @route   GET /events/:eventId/blocked-users
 * @desc    List blocked users for an event
 * @access  Private (organizer/moderator)
 */
router.get('/:eventId/blocked-users', authenticateToken, ModeratorController.getBlockedUsers);

export default router;
