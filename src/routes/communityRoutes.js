import express from 'express';
import CommunityController from '../controllers/CommunityController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', CommunityController.search);

router.post('/users/:userId/follow', authenticateToken, CommunityController.followUser);
router.delete('/users/:userId/follow', authenticateToken, CommunityController.unfollowUser);
router.get('/users/:userId/followers', CommunityController.getUserFollowers);
router.get('/users/:userId/following', CommunityController.getUserFollowing);
router.get('/users/:userId/is-following', authenticateToken, CommunityController.checkFollowing);

router.get('/recommendations', optionalAuthenticateToken, CommunityController.getRecommendations);
router.get('/feed', authenticateToken, CommunityController.getSocialFeed);

export default router;
