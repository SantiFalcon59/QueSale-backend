import express from 'express';
import NotificationController from '../controllers/NotificationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { paginationMiddleware } from '../middleware/validators.js';

const router = express.Router();

/**
 * @route   GET /notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', authenticateToken, paginationMiddleware, NotificationController.getNotifications);

/**
 * @route   POST /notifications/register-token
 * @desc    Register a device token for push notifications
 * @access  Private
 */
router.post('/register-token', authenticateToken, NotificationController.registerToken);

/**
 * @route   POST /notifications/unregister-token
 * @desc    Unregister a device token
 * @access  Private
 */
router.post('/unregister-token', authenticateToken, NotificationController.unregisterToken);

/**
 * @route   POST /notifications/:userId
 * @desc    Create a notification for a user
 * @access  Private
 */
router.post('/:userId', authenticateToken, NotificationController.createNotification);

/**
 * @route   PUT /notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', authenticateToken, NotificationController.markAllAsRead);

/**
 * @route   PUT /notifications/:notificationId/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
router.put('/:notificationId/read', authenticateToken, NotificationController.markAsRead);

/**
 * @route   DELETE /notifications/:notificationId
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:notificationId', authenticateToken, NotificationController.deleteNotification);

export default router;
