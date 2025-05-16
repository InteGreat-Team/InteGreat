/**
 * Email Handler
 * 
 * This handles HTTP requests related to sending emails.
 * It serves as the bridge between API routes and the underlying email service.
 * 
 * Key Components:
 * - Request Validation: Ensures required fields are present
 * - Email Sending: Sends messages using AWS SES
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates recipient email and content before processing
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks email sending attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 500)
 * 
 * This Handler supports the API Gateway integration with email functionality,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendEmail } from '../../shared/services/emailServices';
import { Logger } from '../utils/logger';

// Validate required environment variables
const requiredEnvVars = {
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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('>>> Email handler started');
  const startTime = Date.now();
  const logger = await Logger.getInstance();
  const service = 'Email';

  try {
    await logger.logRequest(service, event, startTime);

    if (!event.body) {
      console.log('>>> No request body found');
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

    const requestBody = JSON.parse(event.body);
    const { to, subject, text, html, cc, bcc } = requestBody;

    // Check required fields
    if (!to || !subject || (!text && !html)) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing required fields",
          details: {
            to: !to ? "Recipient email is required" : undefined,
            subject: !subject ? "Subject is required" : undefined,
            content: (!text && !html) ? "Either text or HTML content is required" : undefined
          }
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Validate email format if to is a string
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof to === 'string' && !emailRegex.test(to)) {
      console.log('Invalid email format:', to);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Invalid email format',
          to
        })
      };
    }

    // If to is an array, validate each email
    if (Array.isArray(to)) {
      const invalidEmails = to.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        console.log('Invalid email formats:', invalidEmails);
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Invalid email format',
            invalidEmails
          })
        };
      }
    }

    // Send email using the email service
    console.log('Attempting to send email with config:', {
      senderEmail: process.env.SES_SENDER_EMAIL,
      to,
      subject,
      region: process.env.AWS_REGION
    });

    const success = await sendEmail({
      to,
      subject,
      text: text || '',
      html: html || '',
      cc,
      bcc
    });
    
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
    const successResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Email sent successfully",
        to,
        subject
      })
    };
    await logger.logResponse(service, event, successResponse, startTime);
    return successResponse;

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
        HAS_AWS_ACCESS_KEY: !!process.env.AWS_ACCESS_KEY_ID,
        HAS_AWS_SECRET_KEY: !!process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    };
    await logger.logError(service, event, error, startTime);
    return errorResponse;
  }
};