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
 * This service is used by controllers to fulfill email-related requests.
 */

import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../config/aws";
import { EventDetails } from '../types/eventTypes';
import { logTransaction } from './eventServices';
import { env } from '../config/env';  // Import validated env

/**
 * Send event details via email to a specified recipient
 * 
 * @param event - Event details object containing all event information
 * @param recipientEmail - Email address of the recipient
 * @returns Promise<boolean> - True if email was sent successfully, false otherwise
 */
export async function sendEventEmail(event: EventDetails, recipientEmail: string): Promise<boolean> {
  try {
    // Log attempt to send email
    console.log(`Sending email about event ${event.name} to ${recipientEmail}`);
    
    // Prepare SES command with email details
    const command = new SendEmailCommand({
      Source: env.SES_SENDER_EMAIL,
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
    
    // Send email using SES client
    const response = await sesClient.send(command);
    console.log('✅ Email sent successfully', response);
    
    // Log successful transaction
    await logTransaction(
      event.event_id,
      'POST',
      'SUCCESS',
      `Email sent to ${recipientEmail}`
    );
    
    return true;
  } catch (error) {
    // Log error and details
    console.error('❌ Error sending email:', error);
    const errorMessage = (error as Error).message;
    
    // Log failed transaction
    await logTransaction(
      event.event_id,
      'POST',
      'ERROR',
      `Email failed: ${errorMessage}`
    );
    
    return false;
  }
}