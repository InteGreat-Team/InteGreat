/**
 * Email Service
 * 
 * This service handles email-related functionality using AWS Simple Email Service (SES).
 * It provides methods for sending event details via email to specified recipients.
 * 
 * Key Components:
 * - SES Integration: Uses AWS SDK v3 for email delivery
 * - HTML Email Generation: Formats event details into readable HTML content
 * - Transaction Logging: Records email sending attempts and results
 * 
 * Features:
 * - Error Handling: Catches and logs SES errors appropriately
 * - Formatted Content: Presents event details in structured HTML format
 * - Environment Configuration: Uses validated environment variables
 * - Result Tracking: Returns boolean success/failure result
 * 
 * This service is used by controllers to fulfill email-related requests,
 * providing a reliable and consistent way to send event notifications.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { EventDetails } from '../types/eventTypes';

// Log environment variables for debugging
console.log('Email service environment:', {
  AWS_REGION: process.env.AWS_REGION,
  HAS_SES_SENDER: !!process.env.SES_SENDER_EMAIL
});

// Initialize SES client with default credentials from Lambda's IAM role
const sesClient = new SESClient({ 
  region: process.env.AWS_REGION
});

/**
 * Send event details via email to a specified recipient
 * 
 * @param event - Event details object containing all event information
 * @param recipientEmail - Email address of the recipient
 * @returns Promise<boolean> - True if email was sent successfully, false otherwise
 */
export async function sendEventEmail(event: EventDetails, recipientEmail: string): Promise<boolean> {
  try {
    // Validate required parameters
    if (!event || !recipientEmail) {
      console.error('Missing required parameters:', { event, recipientEmail });
      return false;
    }

    // Log attempt to send email with full details
    console.log('Attempting to send email:', {
      event,
      recipientEmail,
      senderEmail: process.env.SES_SENDER_EMAIL,
      region: process.env.AWS_REGION
    });

    // Log event details
    console.log('Event details:', {
      id: event.event_id,
      name: event.name,
      date: event.date,
      time: `${event.start_time} - ${event.end_time}`,
      location: event.location
    });

    // Prepare SES command with email details
    const command = new SendEmailCommand({
      Source: process.env.SES_SENDER_EMAIL,
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: `Event Details: ${event.name}`,
        },
        Body: {
          Html: {
            Data: `
              <h1>Event Details</h1>
              <p><strong>Name:</strong> ${event.name}</p>
              <p><strong>Date:</strong> ${event.date || 'Not specified'}</p>
              <p><strong>Time:</strong> ${event.start_time || 'Not specified'} - ${event.end_time || 'Not specified'}</p>
              <p><strong>Location:</strong> ${event.location || 'Not specified'}</p>
              <p><strong>Description:</strong> ${event.description || 'No description available'}</p>
            `,
          },
        },
      },
    });
    
    // Log the email command
    console.log('Email command:', JSON.stringify(command.input, null, 2));

    // Send email using SES client
    const response = await sesClient.send(command);
    console.log('✅ Email sent successfully:', response);
    
    return true;
  } catch (error) {
    // Log detailed error information
    console.error('❌ Error sending email:', {
      error,
      errorMessage: (error as Error).message,
      errorStack: (error as Error).stack,
      eventId: event.event_id,
      recipientEmail,
      senderEmail: process.env.SES_SENDER_EMAIL,
      region: process.env.AWS_REGION
    });
    
    return false;
  }
} 