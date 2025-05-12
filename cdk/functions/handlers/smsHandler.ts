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
  try {
    console.log('Received event:', event);

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing request body"
        })
      };
    }

    const { eventId, recipientPhone } = JSON.parse(event.body);
    console.log('Parsed request:', { eventId, recipientPhone });

    if (!eventId || !recipientPhone) {
      return {
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
    }

    const digits = recipientPhone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 12) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Invalid phone number length"
        })
      };
    }

    // Fetch event details from Supabase
    console.log('Fetching event details for ID:', eventId);
    const eventDetails = await getEventDetails(eventId, supabase);

    if (!eventDetails) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Event not found",
          eventId
        })
      };
    }

    console.log('Event details:', eventDetails);

    const formattedPhone = formatPhoneNumber(recipientPhone);
    console.log('Formatted phone:', formattedPhone);

    // Format the message with event details
    const message = `📢 Event Alert: ${eventDetails.name}
📅 Date: ${eventDetails.date || "Not specified"}
🕒 Time: ${eventDetails.start_time || "Not specified"} - ${eventDetails.end_time || "Not specified"}
📍 Location: ${eventDetails.location || "Not specified"}
📖 Description: ${eventDetails.description || "No description available"}`;

    console.log('Sending SMS with message:', message);

    const smsNotification = {
      recipient: formattedPhone,
      sender_id: 'PhilSMS',
      type: 'plain',
      message
    };

    const response = await philSmsClient.post('/sms/send', smsNotification);
    console.log('SMS API response:', response.data);

    return {
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
  } catch (error) {
    console.error('Error in SMS handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: "Failed to send SMS",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    };
  }
};
