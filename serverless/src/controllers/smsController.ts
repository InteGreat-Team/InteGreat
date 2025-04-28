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
      console.log('📨 Received SMS notification request:', req.body);

      const { eventId, recipientPhone } = req.body;

      // Validate required fields
      if (!eventId || !recipientPhone) {
        res.status(400).json({
          error: "Missing required fields",
          details: {
            eventId: !eventId ? "Event ID is required" : undefined,
            recipientPhone: !recipientPhone ? "Recipient phone number is required" : undefined
          }
        });
      }

      // Get event details
      const event = await getEventDetails(eventId);
      if (!event) {
        res.status(404).json({
          error: "Event not found",
          eventId
        });
      }

      await sendEventNotification(event!, recipientPhone);

      res.json({
        message: "Notification sent successfully",
        eventId,
        recipientPhone
      });
    } catch (error) {
      console.error("❌ Error in sendNotification:", error);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse((error as Error).message);
      } catch {
        errorDetails = {
          message: (error as Error).message,
          stack: (error as Error).stack
        };
      }

      res.status(500).json({
        error: "Failed to send notification",
        eventId: req.body.eventId,
        recipientPhone: req.body.recipientPhone,
        details: errorDetails
      });
    }
  }
}
