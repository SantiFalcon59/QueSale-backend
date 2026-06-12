import axios from 'axios';
import prisma from '../config/prisma.js';

const JINA_API_KEY = process.env.JINA_API_KEY;
const JINA_EMBEDDING_URL = 'https://api.jina.ai/v1/embeddings';

export const InteractionType = {
  VIEW_EVENT: 'VIEW_EVENT',
  SAVE_EVENT: 'SAVE_EVENT',
  UNSAVE_EVENT: 'UNSAVE_EVENT',
  PURCHASE_TICKET: 'PURCHASE_TICKET',
  ATTEND_EVENT: 'ATTEND_EVENT',
  MESSAGE_EVENT: 'MESSAGE_EVENT',
  LIKE_POST: 'LIKE_POST',
  CLICK_CATEGORY: 'CLICK_CATEGORY',
  SEARCH_QUERY: 'SEARCH_QUERY'
};

export class RecommendationService {
  /**
   * Log behavior signal (as implemented before)
   */
  static async logInteraction(userId, type, data = {}) {
    if (!userId) return;
    try {
      const { eventId, organizerId, category, metadata } = data;
      
      const weights = {
        VIEW_EVENT: 1,
        SAVE_EVENT: 5,
        UNSAVE_EVENT: -3,
        PURCHASE_TICKET: 15,
        ATTEND_EVENT: 20,
        MESSAGE_EVENT: 3,
        LIKE_POST: 2,
        CLICK_CATEGORY: 0.5,
        SEARCH_QUERY: 1
      };

      await prisma.userInteraction.create({
        data: {
          id_user: userId,
          type,
          id_event: eventId,
          id_organizer: organizerId,
          category,
          metadata: metadata || {},
          weight: weights[type] || 1,
        },
      });

      // Trigger user profile embedding update in background
      this.updateUserEmbedding(userId).catch(err => console.error('BG Embedding Error:', err));
    } catch (error) {
      console.error('[RecommendationService] Interaction logging failed:', error);
    }
  }

  /**
   * Generate embedding from text using Jina AI
   */
  static async generateEmbedding(text) {
    if (!JINA_API_KEY) {
      console.warn('JINA_API_KEY not set. Returning null embedding.');
      return null;
    }

    try {
      const response = await axios.post(
        JINA_EMBEDDING_URL,
        {
          model: 'jina-embeddings-v2-base-en', // You can change this to a multilingual model if needed
          input: [text]
        },
        {
          headers: {
            'Authorization': `Bearer ${JINA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Jina AI API Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Update event content embedding
   */
  static async updateEventEmbedding(eventId) {
    const event = await prisma.event.findUnique({
      where: { id_event: eventId },
      include: { interests: { include: { interest: true } } }
    });

    if (!event) return;

    const content = `
      Title: ${event.title}
      Description: ${event.description || ''}
      Category: ${event.interests?.[0]?.interest?.name || ''}
      Location: ${event.ubication}
    `.trim();

    const embedding = await this.generateEmbedding(content);
    if (embedding) {
      await prisma.event.update({
        where: { id_event: eventId },
        data: { embedding }
      });
    }
  }

  /**
   * Build user interest profile based on interactions and update embedding
   */
  static async updateUserEmbedding(userId) {
    // Get recent interactions with event details
    const interactions = await prisma.userInteraction.findMany({
      where: { id_user: userId },
      take: 50,
      orderBy: { created_at: 'desc' },
      include: {
        event: {
          select: { title: true, description: true }
        }
      }
    });

    if (interactions.length === 0) return;

    // Create a summarized text of what the user likes
    const positiveInteractions = interactions.filter(i => i.weight > 0);
    const interests = positiveInteractions.map(i => {
      return i.event ? `${i.event.title} ${i.event.description || ''}` : (i.category || '');
    }).join(' ');

    const embedding = await this.generateEmbedding(interests.slice(0, 2000)); // Limit text length
    if (embedding) {
      await prisma.user.update({
        where: { id_user: userId },
        data: { embedding }
      });
    }
  }

  /**
   * Cosine Similarity Helper
   */
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get Recommendations for User
   */
  static async getRecommendations(userId, limit = 10) {
    const user = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { embedding: true }
    });

    // Find all future active events
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        status: 'active'
      },
      select: {
        id_event: true,
        title: true,
        description: true,
        thumbnail_url: true,
        date: true,
        ubication: true,
        price: true,
        embedding: true,
        featured_level: true
      }
    });

    if (!user?.embedding || !Array.isArray(user.embedding)) {
      // Fallback to featured and upcoming
      return events
        .sort((a, b) => b.featured_level - a.featured_level || a.date - b.date)
        .slice(0, limit);
    }

    const userVec = user.embedding;

    // Calculate score: Similarity + Recency + Featured boost
    const scoredEvents = events.map(event => {
      let score = 0;
      if (event.embedding && Array.isArray(event.embedding)) {
        score = this.cosineSimilarity(userVec, event.embedding) * 100;
      } else {
        score = 50; // Neutral starting point for events without embedding
      }

      // Boost featured events
      if (event.featured_level > 0) score += (event.featured_level * 10);

      return { ...event, score };
    });

    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get Trending Events (most viewed/interacted in last 7 days)
   */
  static async getTrendingEvents(limit = 10) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const stats = await prisma.userInteraction.groupBy({
      by: ['id_event'],
      where: {
        id_event: { not: null },
        created_at: { gte: lastWeek }
      },
      _sum: { weight: true },
      orderBy: { _sum: { weight: 'desc' } },
      take: limit
    });

    const eventIds = stats.map(s => s.id_event).filter(id => id !== null);

    return await prisma.event.findMany({
      where: {
        id_event: { in: eventIds },
        date: { gte: new Date() },
        status: 'active'
      }
    });
  }
}

export default RecommendationService;