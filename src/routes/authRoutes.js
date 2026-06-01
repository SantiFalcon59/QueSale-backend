import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { body, validationResult } from 'express-validator';
import { handleValidationErrors } from '../middleware/validators.js';

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 20 }).trim(),
    body('password').isLength({ min: 8 }),
    body('confirmPassword').isLength({ min: 8 }),
    body('photoURL').optional().isURL(),
  ],
  handleValidationErrors,
  AuthController.register
);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  handleValidationErrors,
  AuthController.login
);

/**
 * @route   POST /auth/login-firebase
 * @desc    Login with Firebase token
 * @access  Public
 */
router.post(
  '/login-firebase',
  [body('idToken').notEmpty()],
  handleValidationErrors,
  AuthController.loginWithFirebase
);

/**
 * @route   POST /auth/verify-email
 * @desc    Verify user email
 * @access  Private
 */
router.post('/verify-email', AuthController.verifyEmail);

/**
 * @route   POST /auth/request-password-reset
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/request-password-reset',
  [body('email').isEmail()],
  handleValidationErrors,
  AuthController.requestPasswordReset
);

export default router;
