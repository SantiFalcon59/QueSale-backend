import FeaturedEventModel from '../models/FeaturedEvent.js';
import EventModel from '../models/Event.js';
import OrganizerModel from '../models/Organizer.js';
import MercadoPagoClient from '../config/mercadopago.js';
import { Preference } from 'mercadopago';
import { config } from '../config/index.js';
import crypto from 'crypto';
import { generateId } from '../utils/generators.js';

/**
 * Featured Event Service
 */
export class FeaturedEventService {
  /**
   * Get pricing tier
   */
  static async getPricingTiers() {
    // Pricing configuration
    return {
      level_1: {
        level: 1,
        name: 'Destacado Semanal',
        price: 6000,
        duration_days: 7,
        visibility: 'Standard featured placement',
        description: 'Tu evento aparecerá en la sección de recomendados por una semana completa.',
      },
      level_2: {
        level: 2,
        name: 'Destacado Mensual',
        price: 20000,
        duration_days: 30,
        visibility: 'Premium featured placement',
        description: 'Máxima visibilidad. Tu evento estará destacado durante un mes entero.',
      },
    };
  }

  /**
   * Create featured event with payment
   */
  static async createFeaturedEvent(eventId, level, organizerId, userId) {
    // Verify event exists and belongs to organizer
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'Event not found' };
    }

    if (event.id_organizer !== organizerId) {
      throw { statusCode: 403, message: 'Event does not belong to this organizer' };
    }

    // Verify organizer exists
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    // Verify user is admin of organizer
    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    if (!isAdmin && organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    // Validate level
    if (![1, 2].includes(level)) {
      throw { statusCode: 400, message: 'Invalid level. Use 1 or 2' };
    }

    // Check for existing active featured
    const existing = await FeaturedEventModel.getByEvent(eventId);
    if (existing.length > 0) {
      throw { statusCode: 409, message: 'Event already has an active featured promotion' };
    }

    // Get pricing
    const pricing = await this.getPricingTiers();
    const tierKey = `level_${level}`;
    const tierPrice = pricing[tierKey].price;
    const durationDays = pricing[tierKey].duration_days;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Create featured event (payment pending initially)
    const featuredEventId = generateId();
    const featured = await FeaturedEventModel.create({
      id_featured_event: featuredEventId,
      id_event: eventId,
      id_organizer: organizerId,
      level,
      price: tierPrice,
      payment_id: null, // Will be filled after payment
      start_date: startDate,
      end_date: endDate,
      status: 'pending', // Payment pending
    });

    return {
      featured,
      payment_required: {
        amount: tierPrice,
        currency: 'ARS',
        description: pricing[tierKey].name,
        featured_event_id: featuredEventId,
      },
    };
  }

  /**
   * Process payment (Mercado Pago webhook)
   */
  static async processPayment(featuredEventId, paymentId, status, xSignature = null, requestBody = null) {
    // Validate webhook signature if available
    if (xSignature && requestBody) {
      const isValid = this.validateWebhookSignature(xSignature, requestBody);
      if (!isValid) {
        throw { statusCode: 401, message: 'Invalid webhook signature' };
      }
    }

    const featured = await FeaturedEventModel.findById(featuredEventId);
    if (!featured) {
      throw { statusCode: 404, message: 'Featured event not found' };
    }

    if (status === 'approved' || status === 'completed') {
      const updated = await FeaturedEventModel.update(featuredEventId, {
        payment_id: paymentId,
        status: 'active',
      });
      
      // Update Event table to reflect featured status
      await EventModel.update(featured.id_event, {
        featured_level: featured.level,
        featured_until: featured.end_date
      });

      // Send notification to organizer (future: trigger email/push)
      console.log(`✅ Featured event ${featuredEventId} activated and Event ${featured.id_event} updated`);
      
      return updated;
    } else if (status === 'rejected' || status === 'cancelled' || status === 'failed') {
      await FeaturedEventModel.delete(featuredEventId);
      throw { statusCode: 400, message: `Payment ${status}. Featured event cancelled` };
    }

    return featured;
  }

  /**
   * Validate Mercado Pago webhook signature
   * Uses X-Signature header from Mercado Pago
   */
  static validateWebhookSignature(xSignature, requestBody) {
    try {
      // xSignature format: "ts=1234567890,v1=signature_value"
      const parts = xSignature.split(',');
      const timestamp = parts[0].split('=')[1];
      const signatureReceived = parts[1].split('=')[1];

      // Create signature to verify
      const webhookSecret = config.mercadopago.webhookSecret;
      const signatureString = `${timestamp}.${requestBody}`;
      const hash = crypto
        .createHmac('sha256', webhookSecret)
        .update(signatureString)
        .digest('hex');

      // Compare signatures
      return hash === signatureReceived;
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }

  /**
   * Get active featured events
   */
  static async getActiveFeaturedEvents(level = null) {
    return await FeaturedEventModel.getActiveFeatured(level);
  }

  /**
   * Get featured events for organizer
   */
  static async getOrganizerFeaturedEvents(organizerId, pagination, userId) {
    // Verify user is admin or creator
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    if (!isAdmin && organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    const featured = await FeaturedEventModel.getByOrganizer(organizerId, pagination.limit, pagination.offset);
    const count = await FeaturedEventModel.countByOrganizer(organizerId);

    return {
      featured,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        hasMore: featured.length === pagination.limit,
      },
    };
  }

  /**
   * Get featured event details
   */
  static async getFeaturedEventDetails(featuredEventId, userId = null) {
    const featured = await FeaturedEventModel.findById(featuredEventId);
    if (!featured) {
      throw { statusCode: 404, message: 'Featured event not found' };
    }

    // If user provided, verify authorization for editing
    if (userId) {
      const isAdmin = await OrganizerModel.isAdmin(featured.id_organizer, userId);
      const organizer = await OrganizerModel.findById(featured.id_organizer);

      if (!isAdmin && organizer.id_creator !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
      }
    }

    return featured;
  }

  /**
   * Cancel featured promotion
   */
  static async cancelFeaturedEvent(featuredEventId, userId) {
    const featured = await FeaturedEventModel.findById(featuredEventId);
    if (!featured) {
      throw { statusCode: 404, message: 'Featured event not found' };
    }

    // Verify authorization
    const organizer = await OrganizerModel.findById(featured.id_organizer);
    const isAdmin = await OrganizerModel.isAdmin(featured.id_organizer, userId);

    if (!isAdmin && organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    if (featured.status === 'completed') {
      throw { statusCode: 400, message: 'Cannot cancel completed promotion' };
    }

    await FeaturedEventModel.update(featuredEventId, { status: 'cancelled' });
    return { message: 'Featured promotion cancelled' };
  }

  /**
   * Generate Mercado Pago payment link
   * Creates a preference in Mercado Pago for the organizer to pay
   */
  static async generatePaymentLink(featuredEventId, organizerData) {
    const featured = await FeaturedEventModel.findById(featuredEventId);
    if (!featured) {
      throw { statusCode: 404, message: 'Featured event not found' };
    }

    if (!MercadoPagoClient) {
      throw { statusCode: 500, message: 'Mercado Pago not configured on platform' };
    }

    try {
      // Create preference in Mercado Pago
      const preference = new Preference(MercadoPagoClient);
      
      const body = {
        items: [
          {
            id: featuredEventId,
            title: `Featured Event - Level ${featured.level}`,
            description: `Promotion for event ${featured.id_event}`,
            picture_url: 'https://www.quesale.com/logo.png', // Add logo URL
            quantity: 1,
            unit_price: 1, // Number(featured.price),
            currency_id: 'ARS',
          },
        ],
        payer: {
          name: organizerData.name,
          email: organizerData.email,
        },
        back_urls: {
          success: `${config.frontendUrl}/organizer?status=featured_success&featured_event_id=${featuredEventId}`,
          failure: `${config.frontendUrl}/organizer?status=featured_failure&featured_event_id=${featuredEventId}`,
          pending: `${config.frontendUrl}/organizer?status=featured_pending&featured_event_id=${featuredEventId}`,
        },
        auto_return: 'approved', // Redirect on approved
        notification_url: config.mercadopago.notificationUrl,
        external_reference: featuredEventId, // Link to feature event ID
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
      };

      // Save preference in Mercado Pago and get init_point (payment URL)
      const response = await preference.create({ body });

      return {
        featured_event_id: featuredEventId,
        preference_id: response.id,
        amount: featured.price,
        currency: 'ARS',
        description: `Featured event promotion - Level ${featured.level}`,
        payment_url: response.init_point, // URL to redirect user
        expires_in: 3600, // 1 hour
      };
    } catch (error) {
      console.error('Error generating Mercado Pago payment link:', error);
      throw { statusCode: 500, message: 'Failed to generate payment link', details: error.message };
    }
  }

  /**
   * Get all featured events (admin)
   */
  static async getAllFeaturedEvents(pagination) {
    const featured = await FeaturedEventModel.getAll(pagination.limit, pagination.offset);
    return {
      featured,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        hasMore: featured.length === pagination.limit,
      },
    };
  }

  /**
   * Get revenue analytics (admin)
   */
  static async getRevenueAnalytics(startDate = null, endDate = null) {
    return await FeaturedEventModel.getRevenueAnalytics(startDate, endDate);
  }

  /**
   * Get featured events by level (for feed exposure logic)
   */
  static async getFeaturedByLevel(level) {
    return await FeaturedEventModel.getByLevel(level);
  }
}

export default FeaturedEventService;
