import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import OrganizerController from '../controllers/OrganizerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/organizers
 * Create new organizer
 */
router.post(
  '/',
  authenticateToken,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Name must be between 3 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.createOrganizer
);

/**
 * GET /api/organizers
 * Get all organizers (paginated)
 */
router.get('/', OrganizerController.getOrganizers);

/**
 * GET /api/organizers/me
 * Get user's organizers
 */
router.get('/me', authenticateToken, OrganizerController.getUserOrganizers);

/**
 * GET /api/organizers/:organizerId
 * Get organizer details
 */
router.get(
  '/:organizerId',
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.getOrganizerDetails
);

/**
 * PUT /api/organizers/:organizerId
 * Update organizer
 */
router.put(
  '/:organizerId',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Name must be between 3 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.updateOrganizer
);

/**
 * DELETE /api/organizers/:organizerId
 * Delete organizer
 */
router.delete(
  '/:organizerId',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.deleteOrganizer
);

/**
 * POST /api/organizers/:organizerId/admins
 * Add admin to organizer
 */
router.post(
  '/:organizerId/admins',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
    body('adminId')
      .isUUID()
      .withMessage('Invalid admin ID'),
    body('role')
      .optional()
      .isIn(['admin', 'editor', 'viewer'])
      .withMessage('Role must be admin, editor, or viewer'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.addAdmin
);

/**
 * DELETE /api/organizers/:organizerId/admins/:adminId
 * Remove admin from organizer
 */
router.delete(
  '/:organizerId/admins/:adminId',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
    param('adminId')
      .isUUID()
      .withMessage('Invalid admin ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.removeAdmin
);

/**
 * GET /api/organizers/:organizerId/admins
 * Get organizer admins
 */
router.get(
  '/:organizerId/admins',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.getAdmins
);

/**
 * POST /api/organizers/:organizerId/follow
 * Follow organizer
 */
router.post(
  '/:organizerId/follow',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.followOrganizer
);

/**
 * DELETE /api/organizers/:organizerId/follow
 * Unfollow organizer
 */
router.delete(
  '/:organizerId/follow',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.unfollowOrganizer
);

/**
 * GET /api/organizers/:organizerId/followers
 * Get organizer followers
 */
router.get(
  '/:organizerId/followers',
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.getFollowers
);

/**
 * GET /api/organizers/:organizerId/events
 * Get organizer's events
 */
router.get(
  '/:organizerId/events',
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.getOrganizerEvents
);

/**
 * GET /api/organizers/:organizerId/dashboard
 * Get organizer dashboard analytics
 */
router.get(
  '/:organizerId/dashboard',
  authenticateToken,
  [
    param('organizerId')
      .isUUID()
      .withMessage('Invalid organizer ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  OrganizerController.getDashboardAnalytics
);

export default router;
