/**
 * SMS Controller
 * 
 * This controller handles HTTP requests related to sending notifications via SMS.
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
 * This controller supports the API Gateway integration with SMS notifications,
 * ensuring proper request handling and response formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { getEventDetails } from '../services/eventServices';
import { sendEventNotification } from '../services/smsServices';

export class SNSController {
  /**
   * Send an SMS notification with event details
   * 
   * @param req - Express request object containing eventId and recipientPhone
   * @param res - Express response object for returning HTTP responses
   * @param next - Express next function for error handling
   * @returns Promise<void>
   */
  public static async sendNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract required fields from request body
      const { eventId, recipientPhone } = req.body;

      // Validate required fields
      if (!eventId || !recipientPhone) {
        res.status(400).json({ error: 'eventId and recipientPhone are required' });
        return;
      }

      // Fetch event details from database
      const event = await getEventDetails(eventId);

      // Handle case when event is not found
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Send SMS notification
      const notificationSent = await sendEventNotification(event, recipientPhone);

      // Handle notification sending failure
      if (!notificationSent) {
        res.status(500).json({ error: 'Failed to send notification' });
        return;
      }

      // Return success response
      res.json({ message: 'Notification sent successfully' });
    } catch (error) {
      // Forward unexpected errors to Express error handler
      next(error);
    }
  }
}
