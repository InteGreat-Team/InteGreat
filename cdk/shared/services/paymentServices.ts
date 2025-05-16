import { createPaymentLink, PaymentOptions } from '../../functions/handlers/paymentHandler';

/**
 * Logs the payment request and response for debugging purposes.
 * @param options PaymentOptions - The payment configuration options
 * @returns The checkout URL for the payment
 * @throws Error if the payment link creation fails
 */
export async function logAndCreatePaymentLink(options: PaymentOptions): Promise<string> {
  console.log('[PaymentServices] Payment request:', options);
  try {
    const url = await createPaymentLink(options);
    console.log('[PaymentServices] Payment checkout URL:', url);
    return url;
  } catch (error: any) {
    if (error.response && error.response.data) {
      console.error('[PaymentServices] PayMongo API error response:', error.response.data);
    } else {
      console.error('[PaymentServices] Error:', error.message || error);
    }
    throw error;
  }
} 