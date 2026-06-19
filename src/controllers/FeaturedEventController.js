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
      let xSignature = req.headers['x-signature'];
      let rawBody = req.rawBody || JSON.stringify(req.body); // Ensure we have raw body

      // 1. Check if it is a standard Mercado Pago webhook/IPN payment notification
      const type = req.body?.type || req.query?.topic;
      const paymentIdFromNotification = req.body?.data?.id || req.query?.id;

      let featuredEventId = req.body?.featuredEventId || req.query?.featuredEventId;
      let paymentId = req.body?.paymentId || req.query?.paymentId || paymentIdFromNotification;
      let status = req.body?.status || req.query?.status;

      // If it's a notification from Mercado Pago and we don't have featuredEventId yet, fetch from MP API
      if (!featuredEventId && (type === 'payment' || req.query?.topic === 'payment') && paymentIdFromNotification) {
        console.log(`[FEATURED WEBHOOK] Standard Mercado Pago notification received for payment: ${paymentIdFromNotification}`);
        try {
          const { MercadoPagoConfig, Payment } = await import('mercadopago');
          const { config } = await import('../config/index.js');
          
          const client = new MercadoPagoConfig({ 
            accessToken: config.mercadopago.accessToken,
            options: { timeout: 5000 }
          });
          const paymentClient = new Payment(client);
          const paymentInfo = await paymentClient.get({ id: paymentIdFromNotification });
          
          if (paymentInfo) {
            featuredEventId = paymentInfo.external_reference;
            paymentId = paymentInfo.id;
            status = paymentInfo.status;
            
            // We fetched it directly from the API, so signature check on the notification payload is not needed.
            xSignature = null;
            rawBody = null;
            console.log(`[FEATURED WEBHOOK] Retrieved payment info. FeaturedEventId: ${featuredEventId}, Status: ${status}`);
          }
        } catch (mpError) {
          console.error('[FEATURED WEBHOOK] Error retrieving payment info from Mercado Pago:', mpError);
          // Return 200 to Mercado Pago to stop retries if the payment doesn't exist or is invalid
          return res.status(200).json({ success: false, message: 'Could not fetch payment info' });
        }
      }

      if (!featuredEventId) {
        // If we still don't have featuredEventId, it's either not a payment event or invalid
        console.log(`[FEATURED WEBHOOK] No featuredEventId found in request. Body:`, req.body, `Query:`, req.query);
        // Always return 200 to Mercado Pago to prevent infinite webhook retries for non-payment notifications
        return res.status(200).json({ 
          success: false, 
          message: 'Notification skipped or missing featuredEventId' 
        });
      }

      const result = await FeaturedEventService.processPayment(
        featuredEventId,
        paymentId?.toString(),
        status,
        xSignature,
        rawBody
      );

      // Mercado Pago expects 200 OK response quickly
      sendSuccess(res, result, `Payment ${status || 'processed'}`);
    } catch (error) {
      // Even on error, return 200 to Mercado Pago to prevent retries
      console.error('Webhook error:', error);
      res.status(200).json({ success: false, error: error.message });
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
