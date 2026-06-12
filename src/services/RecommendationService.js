import prisma from '../config/prisma.js';

/**
 * Interaction Types
 */
export const InteractionType = {
  VIEW_EVENT: 'VIEW_EVENT',
  SAVE_EVENT: 'SAVE_EVENT',
  UNSAVE_EVENT: 'UNSAVE_EVENT',
  PURCHASE_TICKET: 'PURCHASE_TICKET',
  ATTEND_EVENT: 'ATTEND_EVENT',
  MESSAGE_EVENT: 'MESSAGE_EVENT',
  LIKE_POST: 'LIKE_POST',
  JOIN_COMMUNITY: 'JOIN_COMMUNITY',
  SEARCH_QUERY: 'SEARCH_QUERY',
  CLICK_CATEGORY: 'CLICK_CATEGORY',
};

/**
 * Weights for each interaction type to help the recommendation engine
 */
const InteractionWeights = {
  [InteractionType.VIEW_EVENT]: 1.0,
  [InteractionType.SAVE_EVENT]: 4.0,
  [InteractionType.UNSAVE_EVENT]: -2.0,
  [InteractionType.PURCHASE_TICKET]: 10.0,
  [InteractionType.ATTEND_EVENT]: 15.0,
  [InteractionType.MESSAGE_EVENT]: 3.0,
  [InteractionType.LIKE_POST]: 2.0,
  [InteractionType.JOIN_COMMUNITY]: 5.0,
  [InteractionType.SEARCH_QUERY]: 1.0,
  [InteractionType.CLICK_CATEGORY]: 0.5,
};

/**
 * Recommendation Service - Handles user behavior signals
 */
export class RecommendationService {
  /**
   * Log a user interaction
   */
  static async logInteraction(userId, type, data = {}) {
    if (!userId) return;

    try {
      const { eventId, organizerId, category, metadata } = data;
      const weight = InteractionWeights[type] || 1.0;

      await prisma.userInteraction.create({
        data: {
          id_user: userId,
          type,
          id_event: eventId,
          id_organizer: organizerId,
          category,
          metadata: metadata || {},
          weight,
        },
      });

      // In the future, this could trigger an async background job 
      // to update user embeddings in real-time.
    } catch (error) {
      // We don't want to crash the main request if logging fails
      console.error('[RecommendationService] Failed to log interaction:', error);
    }
  }

  /**
   * Get user interaction history for AI analysis
   */
  static async getUserInteractions(userId, limit = 100) {
    return await prisma.userInteraction.findMany({
      where: { id_user: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        event: {
          select: {
            title: true,
            description: true,
            ubication: true,
          }
        }
      }
    });
  }
}

export default RecommendationService;