import FeaturedEventService from '../services/FeaturedEventService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

/**
 * Featured Event Controller
 */
export class FeaturedEventController {
  /**
   * Get pricing tiers
   */
  static async getPricingTiers(req, res, next) {
    try {
      const pricing = await FeaturedEventService.getPricingTiers();
      sendSuccess(res, pricing, 'Pricing tiers retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create featured event (initiate payment)
   */
  static async createFeaturedEvent(req, res, next) {
    try {
      const userId = req.user.id;
      const { eventId, level, organizerId } = req.body;

      const result = await FeaturedEventService.createFeaturedEvent(eventId, level, organizerId, userId);
      sendSuccess(res, result, 'Featured event created. Payment required', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process Mercado Pago webhook
   */
  static async processPaymentWebhook(req, res, next) {
    try {
      // For webhook to work properly, we need:
      // 1. X-Signature header from Mercado Pago
      // 2. Raw body string for signature validation
      // 3. The webhook data (status, payment_id, etc)

      const xSignature = req.headers['x-signature'];
      const rawBody = req.rawBody || JSON.stringify(req.body); // Ensure we have raw body

      // Mercado Pago sends data in query parameters for notification endpoint
      const { featuredEventId, paymentId, status } = req.body || req.query;

      if (!featuredEventId) {
        return res.status(400).json({ 
          success: false, 
          error: { message: 'Missing featuredEventId' } 
        });
      }

      const result = await FeaturedEventService.processPayment(
        featuredEventId,
        paymentId,
        status,
        xSignature,
        rawBody
      );

      // Mercado Pago expects 200 OK response quickly
      sendSuccess(res, result, `Payment ${status || 'processed'}`);
    } catch (error) {
      // Even on error, sometimes we need to return 200 to Mercado Pago
      // to prevent retries
      console.error('Webhook error:', error);
      next(error);
    }
  }

  /**
   * Get active featured events
   */
  static async getActiveFeaturedEvents(req, res, next) {
    try {
      const { level } = req.query;
      const featured = await FeaturedEventService.getActiveFeaturedEvents(level ? parseInt(level) : null);
      sendSuccess(res, featured, 'Active featured events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organizer's featured events
   */
  static async getOrganizerFeaturedEvents(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;

      const result = await FeaturedEventService.getOrganizerFeaturedEvents(organizerId, req.pagination, userId);
      sendPaginated(res, result.featured, req.pagination, 'Featured events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured event details
   */
  static async getFeaturedEventDetails(req, res, next) {
    try {
      const { featuredEventId } = req.params;
      const userId = req.user ? req.user.id : null;

      const featured = await FeaturedEventService.getFeaturedEventDetails(featuredEventId, userId);
      sendSuccess(res, featured, 'Featured event retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all featured events (admin)
   */
  static async getAllFeaturedEvents(req, res, next) {
    try {
      const result = await FeaturedEventService.getAllFeaturedEvents(req.pagination);
      sendPaginated(res, result.featured, req.pagination, 'Featured events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel featured promotion
   */
  static async cancelFeaturedEvent(req, res, next) {
    try {
      const userId = req.user.id;
      const { featuredEventId } = req.params;

      const result = await FeaturedEventService.cancelFeaturedEvent(featuredEventId, userId);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate payment link
   */
  static async generatePaymentLink(req, res, next) {
    try {
      const { featuredEventId } = req.params;
      const organizerData = {
        name: req.body.organizerName,
        email: req.body.organizerEmail,
      };

      const paymentLink = await FeaturedEventService.generatePaymentLink(featuredEventId, organizerData);
      sendSuccess(res, paymentLink, 'Payment link generated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue analytics (admin only)
   */
  static async getRevenueAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await FeaturedEventService.getRevenueAnalytics(startDate, endDate);
      sendSuccess(res, analytics, 'Revenue analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured by level (for feed exposure)
   */
  static async getFeaturedByLevel(req, res, next) {
    try {
      const { level } = req.params;
      const featured = await FeaturedEventService.getFeaturedByLevel(level);
      sendSuccess(res, featured, `Featured events level ${level} retrieved`);
    } catch (error) {
      next(error);
    }
  }
}

export default FeaturedEventController;
