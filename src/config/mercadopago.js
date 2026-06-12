import { MercadoPagoConfig } from 'mercadopago';
import { config } from './index.js';

/**
 * Initialize Mercado Pago SDK (v2+)
 */
let client = null;

if (config.mercadopago?.accessToken) {
  try {
    client = new MercadoPagoConfig({
      accessToken: config.mercadopago.accessToken,
      options: { timeout: 5000 }
    });
    console.log('✅ MercadoPago platform client configured successfully');
  } catch (error) {
    console.warn('⚠️ MercadoPago configuration failed:', error.message);
  }
} else {
  console.warn('⚠️ MercadoPago platform access token not configured. Skipping initialization.');
}

export default client;
