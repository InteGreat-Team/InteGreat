/**
 * Reverse Geocode Handler
 * 
 * This handles HTTP requests for reverse geocoding (coordinates to address).
 * It serves as the bridge between API routes and the underlying geolocation service.
 * 
 * Key Components:
 * - Request Validation: Ensures latitude and longitude are present and valid
 * - Reverse Geocoding: Converts coordinates to human-readable addresses
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates latitude and longitude parameters
 * - Coordinate Parsing: Handles different formats of coordinate input
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks geocoding attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 500)
 * 
 * This Handler supports the API Gateway integration with Google Maps Geocoding API,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GeolocationService } from '../../shared/services/geolocationService';
import { ReverseGeocodingParams } from '../../shared/types/geocodeTypes';
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
  const service = 'ReverseGeocode';

  try {
    await logger.logRequest(service, event, startTime);

    // Get latitude and longitude from query parameters or body
    let lat: number | undefined;
    let lng: number | undefined;

    // Check if parameters are in query string
    if (event.queryStringParameters) {
      lat = event.queryStringParameters.lat ? parseFloat(event.queryStringParameters.lat) : undefined;
      lng = event.queryStringParameters.lng ? parseFloat(event.queryStringParameters.lng) : undefined;
    }

    // If not in query string, check request body
    if ((lat === undefined || lng === undefined) && event.body) {
      try {
        const body = JSON.parse(event.body);
        lat = lat ?? body.lat;
        lng = lng ?? body.lng;
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }

    // Validate required parameters
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing or invalid coordinates",
          details: {
            lat: lat === undefined || isNaN(lat) ? "Valid latitude is required" : undefined,
            lng: lng === undefined || isNaN(lng) ? "Valid longitude is required" : undefined
          }
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Validate latitude range (-90 to 90)
    if (lat < -90 || lat > 90) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Invalid latitude",
          details: "Latitude must be between -90 and 90 degrees"
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Validate longitude range (-180 to 180)
    if (lng < -180 || lng > 180) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Invalid longitude",
          details: "Longitude must be between -180 and 180 degrees"
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Initialize the geolocation service
    const geoService = new GeolocationService();
    console.log('Attempting reverse geocode with coordinates:', { lat, lng });
    
    // Create params object
    const params: ReverseGeocodingParams = { lat, lng };
    
    // Perform reverse geocoding
    const results = await geoService.reverseGeocode(params);
    
    const successResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        results: results.results || [],
        status: results.status,
        error_message: results.error_message
      })
    };

    await logger.logResponse(service, event, successResponse, startTime);
    return successResponse;

  } catch (error) {
    console.error('Error in Reverse Geocode handler:', error);
    
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: "Failed to reverse geocode coordinates",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    };

    await logger.logError(service, event, error, startTime);
    return errorResponse;
  }
};