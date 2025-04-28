/**
 * AWS Lambda Handler Configuration
 * 
 * This file serves as the entry point for AWS Lambda. It wraps our Express
 * application with the serverless-http middleware, which transforms Lambda
 * events from API Gateway into Express-compatible request/response objects.
 * 
 * The serverless-http library handles:
 * - Converting API Gateway event objects to HTTP requests
 * - Translating Express HTTP responses back to API Gateway response format
 * - Managing the request/response lifecycle within the Lambda environment
 * 
 * By using this adapter pattern, we can run the same Express application
 * both locally for development and in AWS Lambda for production without
 * modifying our application code.
 * 
 * Future enhancements may include:
 * - Custom serverless-http configuration options
 * - Lambda-specific middleware for request/response processing
 * - Advanced error handling and monitoring
 * - Integration with other AWS services via middleware
 */
import serverless from 'serverless-http';
import app from './app';

// Export the serverless handler
export const handler = serverless(app);