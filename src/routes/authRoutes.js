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
    body('email')
      .isEmail()
      .withMessage('Ingresa un correo electrónico válido')
      .normalizeEmail(),
    body('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('El nombre de usuario debe tener entre 3 y 20 caracteres')
      .trim(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('confirmPassword')
      .isLength({ min: 8 })
      .withMessage('La confirmación de contraseña debe tener al menos 8 caracteres')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),
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
