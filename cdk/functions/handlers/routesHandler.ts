/**
 * Routes Handler
 * 
 * This handles HTTP requests for calculating routes between origins and destinations.
 * It serves as the bridge between API routes and the underlying geolocation service.
 * 
 * Key Components:
 * - Request Validation: Ensures origin and destination are present
 * - Route Calculation: Determines directions, distance, and travel time
 * - Response Handling: Returns appropriate HTTP status codes and JSON responses
 * 
 * Features:
 * - Input Validation: Validates origin and destination parameters
 * - Error Handling: Provides specific error messages based on failure type
 * - Logging: Tracks route calculation attempts and results
 * - Status Codes: Returns semantic HTTP status codes (200, 400, 500)
 * 
 * This Handler supports the API Gateway integration with Google Maps Directions API,
 * ensuring proper request handling and response formatting.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GeolocationService } from '../../shared/services/geolocationService';
import { RoutesParams } from '../../shared/types/routesTypes';
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
  const service = 'Routes';

  try {
    await logger.logRequest(service, event, startTime);

    // Extract parameters from query string or body
    let origin: string | undefined;
    let destination: string | undefined;

    // Check if parameters are in query string
    if (event.queryStringParameters) {
      origin = event.queryStringParameters.origin;
      destination = event.queryStringParameters.destination;
    }

    // If not in query string, check request body
    if ((origin === undefined || destination === undefined) && event.body) {
      try {
        const body = JSON.parse(event.body);
        origin = origin ?? body.origin;
        destination = destination ?? body.destination;
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }

    // Validate required parameters
    if (!origin || !destination) {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: "Missing required parameters",
          details: {
            origin: !origin ? "Origin location is required" : undefined,
            destination: !destination ? "Destination location is required" : undefined
          }
        })
      };
      await logger.logResponse(service, event, response, startTime);
      return response;
    }

    // Initialize the geolocation service
    const geoService = new GeolocationService();
    console.log('Attempting to get routes between:', { origin, destination });
    
    // Create params object
    const params: RoutesParams = { origin, destination };
    
    // Perform route calculation
    const results = await geoService.getRoutes(params);
    
    // Prepare the optimized response
    const routesSummary = results.routes.map(route => ({
      summary: route.summary,
      distance: route.legs[0].distance,
      duration: route.legs[0].duration,
      start_location: route.legs[0].start_location,
      end_location: route.legs[0].end_location,
      steps_count: route.legs[0].steps.length,
      polyline: route.overview_polyline
    }));
    
    const successResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        routes: routesSummary,
        status: results.status,
        full_results: results // Include full results for detailed processing if needed
      })
    };

    await logger.logResponse(service, event, successResponse, startTime);
    return successResponse;

  } catch (error) {
    console.error('Error in Routes handler:', error);
    
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: "Failed to calculate route",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    };

    await logger.logError(service, event, error, startTime);
    return errorResponse;
  }
};