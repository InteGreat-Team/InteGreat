/**
 * Email Handler
 * 
 * This handles HTTP requests related to sending notifications via Email.
 * It serves as the bridge between API routes and the underlying email service.
 * 
 * Key Components:
 * - Request Validation: Ensures required fields are present
 * - Event Retrieval: Fetches event details using the event service
 * - Email Notification: Sends messages using AWS SES
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates eventId and recipientEmail before processing
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks email sending attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 404, 500)
 * 
 * This Handler supports the API Gateway integration with email notifications,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createClient } from '@supabase/supabase-js';
import { getEventDetails } from '../../shared/services/eventServices';
import { sendEventEmail } from '../../shared/services/emailServices';

// Validate required environment variables
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_KEY: process.env.SUPABASE_KEY as string,
  SES_SENDER_EMAIL: process.env.SES_SENDER_EMAIL as string,
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1'
};

// Check if any required environment variables are missing
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Initialize Supabase client
const supabase = createClient(
  requiredEnvVars.SUPABASE_URL,
  requiredEnvVars.SUPABASE_KEY
);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Parse request body
    if (!event.body) {
      console.log('Missing request body');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Missing request body'
        })
      };
    }

    const body = JSON.parse(event.body);
    const { eventId, recipientEmail } = body;
    
    console.log('Parsed request:', { eventId, recipientEmail });

    // Validate required fields
    if (!eventId || !recipientEmail) {
      console.log('Missing required fields:', { eventId, recipientEmail });
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Missing required fields',
          details: {
            eventId: !eventId ? 'Event ID is required' : undefined,
            recipientEmail: !recipientEmail ? 'Recipient email is required' : undefined
          }
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      console.log('Invalid email format:', recipientEmail);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Invalid email format',
          recipientEmail
        })
      };
    }

    // Get event details from Supabase
    console.log('Fetching event details for ID:', eventId);
    const eventDetails = await getEventDetails(eventId, supabase);
    
    if (!eventDetails) {
      console.log('Event not found:', eventId);
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Event not found',
          eventId 
        })
      };
    }

    console.log('Event details:', eventDetails);

    // Send email using the email service
    console.log('Attempting to send email with config:', {
      senderEmail: process.env.SES_SENDER_EMAIL,
      recipientEmail,
      region: process.env.AWS_REGION
    });

    const success = await sendEventEmail(eventDetails, recipientEmail);
    
    if (!success) {
      console.log('Failed to send email');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Failed to send email',
          details: 'Check CloudWatch logs for more information'
        })
      };
    }

    console.log('Email sent successfully');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Email sent successfully',
        eventId,
        recipientEmail
      })
    };

  } catch (error) {
    console.error('Error in email handler:', {
      error,
      errorMessage: (error as Error).message,
      errorStack: (error as Error).stack,
      event: JSON.stringify(event, null, 2),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AWS_REGION: process.env.AWS_REGION,
        HAS_SES_SENDER: !!process.env.SES_SENDER_EMAIL,
        HAS_SUPABASE_URL: !!process.env.SUPABASE_URL,
        HAS_SUPABASE_KEY: !!process.env.SUPABASE_KEY,
        HAS_AWS_ACCESS_KEY: !!process.env.AWS_ACCESS_KEY_ID,
        HAS_AWS_SECRET_KEY: !!process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: (error as Error).message,
        details: 'Check CloudWatch logs for more information'
      })
    };
  }
};