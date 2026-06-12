import express from 'express';
import RecommendationService from '../services/RecommendationService.js';
import { optionalAuthenticateToken } from '../middleware/auth.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

/**
 * @route   GET /api/recommendations
 * @desc    Get AI-powered personalized recommendations
 * @access  Public (Personalized if authenticated)
 */
router.get('/', optionalAuthenticateToken, async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id_user || req.user.id) : null;
    const limit = parseInt(req.query.limit) || 10;
    
    const recommendations = await RecommendationService.getRecommendations(userId, limit);
    sendSuccess(res, recommendations, 'Recommendations retrieved');
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending events based on interactions
 * @access  Public
 */
router.get('/trending', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const events = await RecommendationService.getTrendingEvents(limit);
    sendSuccess(res, events, 'Trending events retrieved');
  } catch (error) {
    next(error);
  }
});

export default router;