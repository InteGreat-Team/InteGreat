/**
 * Event Controller
 * 
 * This controller handles HTTP requests related to retrieving event information.
 * It serves as the bridge between API routes and the underlying event services.
 * 
 * Key Components:
 * - Request Parsing: Extracts and validates event IDs from request parameters
 * - Event Retrieval: Fetches event details using the event service
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - ID Validation: Ensures event IDs are valid numbers
 * - Error Handling: Provides specific error messages based on failure type
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 404)
 * 
 * This controller supports the API Gateway integration with the event retrieval
 * functionality, ensuring proper request handling and response formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { getEventDetails } from '../services/eventServices';

export class EventController {
  /**
   * Get event details by ID
   * 
   * @param req - Express request object containing eventId parameter
   * @param res - Express response object for returning HTTP responses
   * @param next - Express next function for error handling
   * @returns Promise<void>
   */
  public static async getEvent(req: Request<{ eventId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse and validate event ID from request parameters
      const eventId = parseInt(req.params.eventId, 10);
    
      if (isNaN(eventId)) {
        res.status(400).json({ error: 'Invalid event id' });
        return;
      }
    
      // Fetch event details from database
      const event = await getEventDetails(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
    
      // Return event details in response
      res.json(event);
    } catch (error) {
      // Forward unexpected errors to Express error handler
      next(error);
    }
  }
}