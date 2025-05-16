/**
 * Geocode Handler
 * 
 * This handles HTTP requests for geocoding (address to coordinates).
 * It serves as the bridge between API routes and the underlying geolocation service.
 * 
 * Key Components:
 * - Request Validation: Ensures address parameter is present and valid
 * - Geocoding: Converts human-readable addresses to coordinates
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates address parameter
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks geocoding attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 500)
 * 
 * This Handler supports the API Gateway integration with Google Maps Geocoding API,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GeolocationService } from '../../shared/services/geolocationService';
import { GeocodingParams } from '../../shared/types/geocodeTypes';
import { Logger } from '../utils/logger';

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY as string
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
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_MAPS_API_KEY: !!process.env.GOOGLE_MAPS_API_KEY,
    NEON_DB_URL: !!process.env.NEON_DB_URL
  });

  const startTime = Date.now();
  const logger = await Logger.getInstance();
  const service = 'Geocode';

  try {
    await logger.logRequest(service, event, startTime);

    // Get address from query parameters or body
    let address: string | undefined;

    // Check if parameter is in query string
    if (event.queryStringParameters) {
      address = event.queryStringParameters.address;
    }

    // If not in query string, check request body
    if (address === undefined && event.body) {
      try {
        const body = JSON.parse(event.body);
        address = body.address;
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }

    // Validate required parameter
    if (!address || address.trim() === '') {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing required parameter",
          details: "Address parameter is required"
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Initialize the geolocation service
    const geoService = new GeolocationService();
    console.log('Attempting to geocode address:', address);
    
    // Create params object
    const params: GeocodingParams = { address };
    
    // Perform geocoding
    const results = await geoService.geocode(params);
    
    // Extract location data for easy access
    const locations = results.results.map(result => ({
      formatted_address: result.formatted_address,
      location: result.geometry.location,
      place_id: result.place_id,
      types: result.types
    }));
    
    const successResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        results: results.results,
        locations, // Simplified location data
        status: results.status,
        error_message: results.error_message
      })
    };

    await logger.logResponse(service, event, successResponse, startTime);
    return successResponse;

  } catch (error) {
    console.error('Error in Geocode handler:', error);
    
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: "Failed to geocode address",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    };

    await logger.logError(service, event, error, startTime);
    return errorResponse;
  }
};