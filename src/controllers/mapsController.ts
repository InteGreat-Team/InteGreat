/**
 * Maps Controller
 * 
 * This controller handles HTTP requests related to geographical and location-based operations.
 * It serves as the bridge between API routes and the underlying maps services.
 * 
 * Key Components:
 * - Coordinate Parsing: Extracts and validates latitude/longitude from queries
 * - Location Services: Uses Google Maps API to fetch nearby churches
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Coordinate Validation: Ensures latitude and longitude are valid numbers
 * - Error Handling: Provides specific error messages based on failure type
 * - Status Codes: Returns semantic HTTP status codes (200, 400)
 * 
 * This controller supports the API Gateway integration with the maps functionality,
 * ensuring proper request handling and response formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { getNearbyChurches } from '../services/mapsServices';

export class MapsController {
  /**
   * Get nearby churches based on location coordinates
   * 
   * @param req - Express request object containing lat/lng query parameters
   * @param res - Express response object for returning HTTP responses
   * @param next - Express next function for error handling
   * @returns Promise<void>
   */
  public static async fetchNearbyChurches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse and validate coordinates from request query
      const { lat, lng, radius } = req.query;
      
      if (!lat || !lng) {
        res.status(400).json({ error: 'Latitude and Longitude are required' });
        return;
      }
      
      const latitude = Number(lat);
      const longitude = Number(lng);
      const searchRadius = radius ? Number(radius) : undefined;
      
      // Validate coordinate values
      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({ error: 'Invalid coordinate values' });
        return;
      }
      
      // Fetch nearby churches using maps service
      const churches = await getNearbyChurches(latitude, longitude, searchRadius);
      
      // Return churches in response
      res.json({ churches });
    } catch (error) {
      // Forward unexpected errors to Express error handler
      next(error);
    }
  }
}