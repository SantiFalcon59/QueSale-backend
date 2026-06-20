import express from 'express';
import AllowedLocationController from '../controllers/AllowedLocationController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/allowed-locations
 * @desc    Get all allowed locations (including inactive for admin management)
 * @access  Private (Admin only)
 */
router.get('/', authenticateToken, requireAdmin, AllowedLocationController.getAll);

/**
 * @route   GET /api/allowed-locations/active
 * @desc    Get all active allowed locations (for frontend/mobile selectors)
 * @access  Public
 */
router.get('/active', AllowedLocationController.getActive);

/**
 * @route   GET /api/allowed-locations/check
 * @desc    Check if a city/state/country is allowed
 * @access  Public
 */
router.get('/check', AllowedLocationController.check);

/**
 * @route   POST /api/allowed-locations
 * @desc    Create a new allowed location
 * @access  Private (Admin only)
 */
router.post('/', authenticateToken, requireAdmin, AllowedLocationController.create);

/**
 * @route   PUT /api/allowed-locations/:id
 * @desc    Update an allowed location (e.g. toggle active status)
 * @access  Private (Admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, AllowedLocationController.update);

/**
 * @route   DELETE /api/allowed-locations/:id
 * @desc    Delete an allowed location
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, AllowedLocationController.delete);

export default router;
