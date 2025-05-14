/**
 * Payment Handler
 * 
 * This module handles payment processing through the PayMongo payment gateway.
 * It creates payment links that redirect users to PayMongo's checkout page.
 * 
 * Key Components:
 * - Payment Link Creation: Generates PayMongo checkout links
 * - Configuration Management: Loads payment details from JSON files
 * - Environment Variables: Securely manages API keys
 * - Error Handling: Provides detailed error information
 * 
 * Features:
 * - Secure Authentication: Uses environment variables for API keys
 * - Flexible Configuration: Supports JSON-based payment configuration
 * - Custom Payment Options: Configurable amount, description, currency, etc.
 * - Redirect URLs: Customizable success and failure redirect endpoints
 * - Error Handling: Comprehensive error reporting and logging
 * 
 * This handler supports integration with payment gateways for e-commerce applications,
 * ensuring secure and reliable payment processing through the PayMongo API.
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Configure dotenv to load environment variables
dotenv.config({ path: '../../.env' });

// Replace with your PayMongo API keys from environment variables
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

/**
 * Interface for payment options
 */
interface PaymentOptions {
  amount: number;
  description: string;
  remarks?: string;
  currency?: string;
  successUrl?: string;
  failureUrl?: string;
}

function getPaymongoSecretKey(): string {
  return process.env.PAYMONGO_SECRET_KEY || '';
}

/**
 * Creates a payment link through the PayMongo API
 * 
 * @param options - Payment configuration options
 * @param options.amount - Amount in smallest currency unit (e.g., centavos for PHP)
 * @param options.description - Description of the payment
 * @param options.remarks - Additional remarks for the payment
 * @param options.currency - Currency code (default: PHP)
 * @param options.successUrl - URL to redirect after successful payment
 * @param options.failureUrl - URL to redirect after failed payment
 * @returns The checkout URL for the payment
 * @throws Error if the API request fails
 */
async function createPaymentLink(options: PaymentOptions): Promise<string> {
  const key = getPaymongoSecretKey();
  if (!key) {
    console.error('PAYMONGO_SECRET_KEY is not set!');
    throw new Error('PAYMONGO_SECRET_KEY is not set');
  }
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.paymongo.com/v1/links',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(key + ':').toString('base64')}`
      },
      data: {
        data: {
          attributes: {
            amount: options.amount,
            description: options.description,
            remarks: options.remarks || '',
            currency: options.currency || 'PHP',
            success_url: options.successUrl || 'https://your-website.com/success',
            failure_url: options.failureUrl || 'https://your-website.com/failed',
          }
        }
      }
    });
    return response.data.data.attributes.checkout_url;
  } catch (error: any) {
    if (error.response && error.response.data) {
      console.error('PayMongo API error response:', error.response.data);
    } else {
      console.error('Error:', error.message || error);
    }
    throw error;
  }
}

/**
 * Reads payment configuration from a JSON file
 * 
 * @param filePath - Path to the JSON configuration file
 * @returns Payment configuration object
 * @throws Error if the file cannot be read or parsed
 */
function readPaymentOptionsFromFile(filePath: string): PaymentOptions {
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync(filePath, 'utf8');
    // Parse JSON string to object
    const paymentOptions = JSON.parse(jsonData);
    
    console.log('Payment options loaded from file:', filePath);
    return paymentOptions;
  } catch (error: any) {
    console.error('Error reading payment options file:', error.message);
    // Return default options if file can't be read
    return {
      amount: 10000,
      description: 'Default payment',
      remarks: 'File could not be read',
      currency: 'PHP',
      successUrl: 'https://your-website.com/payment-success',
      failureUrl: 'https://your-website.com/payment-failed'
    };
  }
}

/**
 * Generates a checkout link using configuration from a JSON file
 * 
 * @param jsonFileName - Name of the JSON configuration file in the events directory
 * @returns The checkout URL for the payment
 * @throws Error if the payment link creation fails
 */
async function generateCheckoutLink(jsonFileName?: string): Promise<string | undefined> {
  // Define default path to the events folder (going up two levels and into events)
  // If no file name is provided, use a default name
  const fileName = jsonFileName || 'payment-event.json';
  const filePath = path.resolve(__dirname, '../../events', fileName);
  
  // Read payment options from file
  const paymentOptions = readPaymentOptionsFromFile(filePath);
  
  try {
    const checkoutUrl = await createPaymentLink(paymentOptions);
    return checkoutUrl;
  } catch (error) {
    console.error('Failed to generate checkout link:', error);
    return undefined;
  }
}

// Example route in an Express app
// app.get('/checkout', async (req, res) => {
//   try {
//     const checkoutUrl = await generateCheckoutLink();
//     res.redirect(checkoutUrl);
//   } catch (error) {
//     res.status(500).send('Error generating checkout link');
//   }
// });

// Execute if run directly (not imported as a module)
if (require.main === module) {
  generateCheckoutLink('payment-event.json').then(url => {
    if (url) {
      console.log(url);
      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      console.log(`\nGenerated at: ${dateStr} UTC`);
      console.log('Copy this URL to your browser to complete the payment');
    } else {
      console.error('Failed to generate checkout URL');
    }
  });
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }
    let paymentOptions: PaymentOptions;
    try {
      paymentOptions = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }
    if (!paymentOptions.amount || !paymentOptions.description) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields: amount and description' }),
      };
    }
    const key = getPaymongoSecretKey();
    if (!key) {
      console.error('PAYMONGO_SECRET_KEY is not set!');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'PAYMONGO_SECRET_KEY is not set in environment' }),
      };
    }
    console.log('PAYMONGO_SECRET_KEY (partial):', key ? key.slice(0, 6) + '...' + key.slice(-4) : 'NOT SET');
    let checkoutUrl: string;
    try {
      checkoutUrl = await createPaymentLink(paymentOptions);
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.error('PayMongo API error response:', error.response.data);
        return {
          statusCode: error.response.status || 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: error.response.data || 'PayMongo API error' }),
        };
      } else {
        console.error('Error:', error.message || error);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
        };
      }
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutUrl }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};

// Export functions for use in other files
export {
  createPaymentLink,
  generateCheckoutLink,
  PaymentOptions
};