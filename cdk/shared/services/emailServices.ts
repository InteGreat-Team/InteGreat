/**
 * Email Service
 * 
 * This service handles email-related functionality using AWS Simple Email Service (SES).
 * It provides a general-purpose method for sending emails to specified recipients.
 * 
 * Key Components:
 * - SES Integration: Uses AWS SDK v3 for email delivery
 * - Flexible Email Options: Supports various email formats and recipients
 * - Transaction Logging: Records email sending attempts and results
 * 
 * Features:
 * - Error Handling: Catches and logs SES errors appropriately
 * - Multiple Content Types: Supports both HTML and plain text formats
 * - CC/BCC Support: Allows carbon copy and blind carbon copy recipients
 * - Environment Configuration: Uses validated environment variables
 * - Result Tracking: Returns boolean success/failure result
 * 
 * This service is used by controllers to fulfill email-related requests,
 * providing a reliable and consistent way to send notifications.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { EmailOptions, EmailAttachement } from '../types/emailTypes';

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
 * Send an email using AWS SES
 * 
 * @param options - Email options containing recipient, subject, content, etc.
 * @returns Promise<boolean> - True if email was sent successfully, false otherwise
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Validate required parameters
    if (!options.to || !options.subject || (!options.text && !options.html)) {
      console.error('Missing required email parameters:', options);
      return false;
    }

    // Log attempt to send email
    console.log('Attempting to send email:', {
      to: options.to,
      subject: options.subject,
      senderEmail: process.env.SES_SENDER_EMAIL,
      region: process.env.AWS_REGION
    });

    // Build email message
    const emailMessage: any = {
      Subject: { Data: options.subject }
    };

    // Add body content
    emailMessage.Body = {};
    if (options.text) {
      emailMessage.Body.Text = { Data: options.text };
    }
    if (options.html) {
      emailMessage.Body.Html = { Data: options.html };
    }

    // Prepare destination addresses
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
    const ccAddresses = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
    const bccAddresses = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined;

    // Prepare SES command with email details
    const command = new SendEmailCommand({
      Source: process.env.SES_SENDER_EMAIL,
      Destination: {
        ToAddresses: toAddresses,
        CcAddresses: ccAddresses,
        BccAddresses: bccAddresses
      },
      Message: emailMessage
    });
    
    // Note about attachments
    if (options.attachments && options.attachments.length > 0) {
      console.warn('Attachments are not directly supported with basic SES SendEmailCommand');
      // For attachments, you would need to use MIME or SendRawEmailCommand
    }
    
    // Log the email command (simplified for clarity)
    console.log('Email command prepared for sending');

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
      to: options.to,
      subject: options.subject,
      senderEmail: process.env.SES_SENDER_EMAIL,
      region: process.env.AWS_REGION
    });
    
    return false;
  }
}
