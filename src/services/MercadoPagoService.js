import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * Mercado Pago Service
 */
export class MercadoPagoService {
  /**
   * Create a payment preference for a ticket
   */
  static async createTicketPreference(event, user, organizer) {
    if (!organizer.mp_access_token) {
      throw new Error('El organizador no tiene configurado Mercado Pago');
    }

    const client = new MercadoPagoConfig({ 
      accessToken: organizer.mp_access_token,
      options: { timeout: 5000 }
    });

    const preference = new Preference(client);

    const body = {
      items: [
        {
          id: event.id_event,
          title: `Entrada: ${event.title}`,
          quantity: 1,
          unit_price: 5, // Number(event.price),
          currency_id: 'ARS',
        }
      ],
      payer: {
        email: user.email,
        name: user.username,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'https://quesale.splindux.com'}/my-tickets?status=success`,
        failure: `${process.env.FRONTEND_URL || 'https://quesale.splindux.com'}/event/${event.id_event}?status=failure`,
        pending: `${process.env.FRONTEND_URL || 'https://quesale.splindux.com'}/my-tickets?status=pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        eventId: event.id_event,
        userId: user.id_user,
        type: 'ticket_purchase'
      }),
      notification_url: `${process.env.API_URL}/api/tickets/webhook/mercadopago?orgId=${organizer.id_organizer}`,
    };

    const response = await preference.create({ body });
    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    };
  }

  /**
   * Verify payment details
   */
  static async verifyPayment(paymentId, organizerToken) {
    const { Payment } = await import('mercadopago');
    const client = new MercadoPagoConfig({ 
      accessToken: organizerToken,
      options: { timeout: 5000 }
    });
    const payment = new Payment(client);
    return await payment.get({ id: paymentId });
  }
}

export default MercadoPagoService;
