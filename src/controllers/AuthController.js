import AuthService from '../services/AuthService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Authentication Controller
 */
export class AuthController {
  /**
   * Register endpoint
   */
  static async register(req, res, next) {
    try {
      const { email, username, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return sendError(res, 'Passwords do not match', 400);
      }

      const result = await AuthService.registerUser({ email, username, password });
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login endpoint
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser({ email, password });
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login with Firebase
   */
  static async loginWithFirebase(req, res, next) {
    try {
      const { idToken, photoURL } = req.body;
      
      if (!idToken) {
        return sendError(res, 'ID token is required', 400);
      }

      const result = await AuthService.loginWithFirebase(idToken, photoURL);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      console.error('LoginWithFirebase controller error:', {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * Verify email endpoint
   */
  static async verifyEmail(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await AuthService.verifyEmail(userId);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.resetPassword(email);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
