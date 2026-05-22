import MercadoPago from 'mercadopago';
import { config } from './index.js';

/**
 * Initialize Mercado Pago SDK - Optional (development mode)
 */
if (config.mercadopago?.accessToken) {
  try {
    MercadoPago.configure({
      access_token: config.mercadopago.accessToken,
      custom_headers: {
        'user-agent': 'QueSale/1.0',
      },
    });
    console.log('✅ MercadoPago configured successfully');
  } catch (error) {
    console.warn('⚠️ MercadoPago configuration failed:', error.message);
  }
} else {
  console.warn('⚠️ MercadoPago access token not configured. Skipping initialization.');
}

export default MercadoPago;
