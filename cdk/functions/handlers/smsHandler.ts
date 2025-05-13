/**
 * SMS Handler
 * 
 * This handles HTTP requests related to sending notifications via SMS.
 * It serves as the bridge between API routes and the underlying SMS service.
 * 
 * Key Components:
 * - Request Validation: Ensures required fields are present
 * - Event Retrieval: Fetches event details using the event service
 * - SMS Notification: Sends messages using PHIL SMS service
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates eventId and recipientPhone before processing
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks SMS notification attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 404, 500)
 * 
 * This Handler supports the API Gateway integration with SMS notifications,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { getEventDetails } from '../../shared/services/eventServices';
import { Logger } from '../utils/logger';

// Validate required environment variables
const requiredEnvVars = {
  PHIL_SMS_API_URL: process.env.PHIL_SMS_API_URL as string,
  PHIL_SMS_API_KEY: process.env.PHIL_SMS_API_KEY as string,
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_KEY: process.env.SUPABASE_KEY as string
};

// Check if any required environment variables are missing
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Initialize clients with proper types
const philSmsClient = axios.create({
  baseURL: requiredEnvVars.PHIL_SMS_API_URL,
  headers: {
    'Authorization': `Bearer ${requiredEnvVars.PHIL_SMS_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Initialize Supabase client
const supabase = createClient(
  requiredEnvVars.SUPABASE_URL,
  requiredEnvVars.SUPABASE_KEY
);

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `+63${digits.substring(1)}`;
  if (digits.startsWith('63')) return `+${digits}`;
  if (digits.startsWith('+')) return digits;
  return `+63${digits}`;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_KEY: !!process.env.SUPABASE_KEY,
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

    const { eventId, recipientPhone } = JSON.parse(event.body);

    if (!eventId || !recipientPhone) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing required fields",
          details: {
            eventId: !eventId ? "Event ID is required" : undefined,
            recipientPhone: !recipientPhone ? "Recipient phone number is required" : undefined
          }
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

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

    const eventDetails = await getEventDetails(eventId, supabase);

    if (!eventDetails) {
      const response = {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Event not found",
          eventId
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    const formattedPhone = formatPhoneNumber(recipientPhone);

    const message = `📢 Event Alert: ${eventDetails.name}
📅 Date: ${eventDetails.date || "Not specified"}
🕒 Time: ${eventDetails.start_time || "Not specified"} - ${eventDetails.end_time || "Not specified"}
📍 Location: ${eventDetails.location || "Not specified"}
📖 Description: ${eventDetails.description || "No description available"}`;

    const smsNotification = {
      recipient: formattedPhone,
      sender_id: 'PhilSMS',
      type: 'plain',
      message
    };

    const response = await philSmsClient.post('/sms/send', smsNotification);

    const successResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "SMS sent successfully",
        eventId,
        recipient: formattedPhone,
        response: response.data
      })
    };
    await logger.logResponse(service, event, successResponse, startTime);
    return successResponse;

  } catch (error) {
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
