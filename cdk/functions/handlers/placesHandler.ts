/**
 * Places Handler
 * 
 * This handles HTTP requests related to places search using Google Maps API.
 * It serves as the bridge between API routes and the underlying geolocation service.
 * 
 * Key Components:
 * - Request Validation: Ensures required fields are present based on operation type
 * - Places Search: Performs nearby or text search using Google Maps API
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates location, radius, query parameters based on operation
 * - Operation Selection: Supports both NEARBY_SEARCH and TEXT_SEARCH operations
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks places search attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 500)
 * 
 * This Handler supports the API Gateway integration with Google Maps Places API,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GeolocationService } from '../../shared/services/geolocationService';
import { PlacesParams } from '../../shared/types/placesTypes';
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
  const service = 'Places';

  try {
    await logger.logRequest(service, event, startTime);

    if (!event.body) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing request body"
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    const params = JSON.parse(event.body) as PlacesParams;
    
    // Validate based on operation type
    if (params.operation === 'NEARBY_SEARCH') {
      if (!params.location || !params.radius) {
        const response = {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: "Missing required fields for nearby search",
            details: {
              location: !params.location ? "Location is required" : undefined,
              radius: !params.radius ? "Radius is required" : undefined
            }
          })
        };
        await logger.logResponse(service, event, response, startTime);
        return response;
      }
    } else if (params.operation === 'TEXT_SEARCH') {
      if (!params.query) {
        const response = {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: "Missing required fields for text search",
            details: {
              query: "Search query is required"
            }
          })
        };
        await logger.logResponse(service, event, response, startTime);
        return response;
      }
    } else {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Invalid operation",
          details: "Operation must be either NEARBY_SEARCH or TEXT_SEARCH"
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Initialize the geolocation service
    const geoService = new GeolocationService();
    console.log(`Attempting ${params.operation} with parameters:`, params);
    
    // Perform the search
    const results = await geoService.getPlaces(params);
    
    const successResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        results: results.results || [],
        status: results.status,
        html_attributions: results.html_attributions || [],
        next_page_token: results.next_page_token
      })
    };

    await logger.logResponse(service, event, successResponse, startTime);
    return successResponse;

  } catch (error) {
    console.error('Error in Places handler:', error);
    
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: "Failed to search places",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    };

    await logger.logError(service, event, error, startTime);
    return errorResponse;
  }
};