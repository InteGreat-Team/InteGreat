/**
 * Email Controller
 * 
 * This controller handles HTTP requests related to sending emails with event information.
 * It serves as the bridge between API routes and the underlying email and event services.
 * 
 * Key Components:
 * - Request Validation: Ensures required fields are present
 * - Event Retrieval: Fetches event details using the event service
 * - Email Dispatch: Sends formatted emails using AWS SES
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates eventId and recipientEmail before processing
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks email sending attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 404, 500)
 * 
 * This controller supports the API Gateway integration with the email sending
 * functionality, ensuring proper request handling and response formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { getEventDetails } from '../services/eventServices';
import { sendEventEmail } from '../services/emailServices';

export class EmailController {
  /**
   * Send an email with event details
   * 
   * @param req - Express request object containing eventId and recipientEmail
   * @param res - Express response object for returning HTTP responses
   * @param next - Express next function for error handling
   * @returns Promise<void>
   */
  public static async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract required fields from request body
      const { eventId, recipientEmail } = req.body;

      // Validate required fields
      if (!eventId || !recipientEmail) {
        res.status(400).json({ error: 'eventId and recipientEmail are required' });
        return;
      }

      // Fetch event details from database
      const event = await getEventDetails(eventId);

      // Handle case when event is not found
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Send email with event details
      const emailSent = await sendEventEmail(event, recipientEmail);

      // Handle email sending failure
      if (!emailSent) {
        res.status(500).json({ error: 'Failed to send email' });
        return;
      }

      // Return success response
      res.json({ message: 'Email sent successfully' });
    } catch (error) {
      // Forward unexpected errors to Express error handler
      next(error);
    }
  }
}