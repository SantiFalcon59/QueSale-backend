import express from 'express';
import TicketController from '../controllers/TicketController.js';
import { authenticateToken } from '../middleware/auth.js';
import { paginationMiddleware, handleValidationErrors } from '../middleware/validators.js';
import { body } from 'express-validator';

const router = express.Router();

/**
 * @route   POST /tickets/purchase
 * @desc    Purchase ticket for event
 * @access  Private
 */
router.post(
  '/purchase',
  authenticateToken,
  [body('eventId').notEmpty()],
  handleValidationErrors,
  TicketController.purchaseTicket
);

/**
 * @route   GET /tickets/my-tickets
 * @desc    Get user's tickets
 * @access  Private
 */
router.get(
  '/my-tickets',
  authenticateToken,
  paginationMiddleware,
  TicketController.getUserTickets
);

/**
 * @route   GET /tickets/:ticketUuid/details
 * @desc    Get ticket details
 * @access  Private
 */
router.get(
  '/:ticketUuid/details',
  authenticateToken,
  TicketController.getTicketDetails
);

/**
 * @route   POST /tickets/:ticketUuid/validate
 * @desc    Validate ticket at entrance
 * @access  Private
 */
router.post(
  '/:ticketUuid/validate',
  authenticateToken,
  TicketController.validateTicket
);

/**
 * @route   DELETE /tickets/:ticketId
 * @desc    Cancel ticket
 * @access  Private
 */
router.delete(
  '/:ticketId',
  authenticateToken,
  TicketController.cancelTicket
);

/**
 * @route   GET /tickets/event/:eventId/attendees
 * @desc    Get event attendees (organizer only)
 * @access  Private
 */
router.get(
  '/event/:eventId/attendees',
  authenticateToken,
  paginationMiddleware,
  TicketController.getEventAttendees
);

export default router;
