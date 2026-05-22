import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import FeaturedEventController from '../controllers/FeaturedEventController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/featured/pricing
 * Get pricing tiers
 */
router.get('/pricing', FeaturedEventController.getPricingTiers);

/**
 * POST /api/featured/webhook/payment
 * Mercado Pago payment webhook
 */
router.post(
  '/webhook/payment',
  [
    body('featuredEventId')
      .isUUID()
      .withMessage('Invalid featured event ID'),
    body('paymentId')
      .notEmpty()
      .withMessage('Payment ID required'),
    body('status')
      .isIn(['approved', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  FeaturedEventController.processPaymentWebhook
);

/**
 * GET /api/featured/active
 * Get active featured events
 */
router.get(
  '/active',
  [
    query('level')
      .optional()
      .isIn([1, 2])
      .withMessage('Level must be 1 or 2'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  FeaturedEventController.getActiveFeaturedEvents
);

/**
 * GET /api/featured/level/:level
 * Get featured events by level (for feed exposure logic)
 */
router.get(
  '/level/:level',
  [
    param('level')
      .isIn([1, 2])
      .withMessage('Level must be 1 or 2'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  FeaturedEventController.getFeaturedByLevel
);

/**
 * GET /api/featured/analytics/revenue
 * Get revenue analytics (admin)
 */
router.get(
  '/analytics/revenue',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Valid start date required'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Valid end date required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  FeaturedEventController.getRevenueAnalytics
);

/**
 * GET /api/featured/organizer/:organizerId
 * Get organizer's featured events
 */
router.get(
  '/organizer/:organizerId',
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
  FeaturedEventController.getOrganizerFeaturedEvents
);

/**
 * POST /api/featured
 * Create featured event (initiate payment)
 */
router.post(
  '/',
  authenticateToken,
  [
    body('eventId')
      .isUUID()
      .withMessage('Invalid event ID'),
    body('level')
      .isIn([1, 2])
      .withMessage('Level must be 1 or 2'),
    body('organizerId')
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
  FeaturedEventController.createFeaturedEvent
);

/**
 * GET /api/featured
 * Get all featured events (admin)
 */
router.get(
  '/',
  FeaturedEventController.getAllFeaturedEvents
);

/**
 * POST /api/featured/:featuredEventId/payment-link
 * Generate payment link
 */
router.post(
  '/:featuredEventId/payment-link',
  authenticateToken,
  [
    param('featuredEventId')
      .isUUID()
      .withMessage('Invalid featured event ID'),
    body('organizerName')
      .trim()
      .notEmpty()
      .withMessage('Organizer name required'),
    body('organizerEmail')
      .isEmail()
      .withMessage('Valid organizer email required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  FeaturedEventController.generatePaymentLink
);

/**
 * GET /api/featured/:featuredEventId
 * Get featured event details
 */
router.get(
  '/:featuredEventId',
  [
    param('featuredEventId')
      .isUUID()
      .withMessage('Invalid featured event ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  optionalAuthenticateToken,
  FeaturedEventController.getFeaturedEventDetails
);

/**
 * DELETE /api/featured/:featuredEventId
 * Cancel featured promotion
 */
router.delete(
  '/:featuredEventId',
  authenticateToken,
  [
    param('featuredEventId')
      .isUUID()
      .withMessage('Invalid featured event ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }
    next();
  },
  FeaturedEventController.cancelFeaturedEvent
);

export default router;
