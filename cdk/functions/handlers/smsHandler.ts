/**
 * SMS Handler
 * 
 * This handles HTTP requests related to sending messages via SMS.
 * It serves as the bridge between API routes and the underlying SMS service.
 * 
 * Key Components:
 * - Request Validation: Ensures required fields are present
 * - SMS Sending: Sends messages using PHIL SMS service
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates recipientPhone and message content
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks SMS sending attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 500)
 * 
 * This Handler supports the API Gateway integration with SMS functionality,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendSms } from '../../shared/services/smsServices';
import { Logger } from '../utils/logger';

// Validate required environment variables
const requiredEnvVars = {
  PHIL_SMS_API_URL: process.env.PHIL_SMS_API_URL as string,
  PHIL_SMS_API_KEY: process.env.PHIL_SMS_API_KEY as string
};

// Check if any required environment variables are missing
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PHIL_SMS_API_URL: !!process.env.PHIL_SMS_API_URL,
    PHIL_SMS_API_KEY: !!process.env.PHIL_SMS_API_KEY,
    NEON_DB_URL: !!process.env.NEON_DB_URL,
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED
  });

  const startTime = Date.now();
  const logger = await Logger.getInstance();
  const service = 'SMS';

  try {
    await logger.logRequest(service, event, startTime);

    if (!event.body) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing request body"
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    const { recipientPhone, message, senderId } = JSON.parse(event.body);

    // Validate required fields
    if (!recipientPhone || !message) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing required fields",
          details: {
            recipientPhone: !recipientPhone ? "Recipient phone number is required" : undefined,
            message: !message ? "Message content is required" : undefined
          }
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Validate phone number format
    const digits = recipientPhone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 12) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Invalid phone number length"
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Send SMS using the generalized SMS service
    console.log('Attempting to send SMS to:', recipientPhone);
    
    const result = await sendSms(
      recipientPhone,
      message,
      senderId || 'PhilSMS'
    );

    if (!result) {
      const errorResponse = {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Failed to send SMS",
          details: "See logs for more information"
        })
      };
      await logger.logResponse(service, event, errorResponse, startTime);
      return errorResponse;
    }

    const successResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "SMS sent successfully",
        recipient: recipientPhone,
        contentLength: message.length
      })
    };
    await logger.logResponse(service, event, successResponse, startTime);
    return successResponse;

  } catch (error) {
    console.error('Error in SMS handler:', error);
    
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: "Failed to send SMS",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    };
    await logger.logError(service, event, error, startTime);
    return errorResponse;
  }
};