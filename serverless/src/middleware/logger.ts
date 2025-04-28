/**
 * Request Logger Middleware
 * 
 * This middleware logs API requests and responses to the database using Supabase.
 * It captures request details, response data, and performance metrics for monitoring
 * and debugging purposes.
 * 
 * Key Features:
 * - Execution Time Tracking: Measures time taken to process each request
 * - Response Capturing: Intercepts and stores response bodies
 * - Asynchronous Logging: Logs data after response is sent to client
 * - Error Handling: Ensures logging errors don't affect request processing
 * 
 * This middleware is applied globally to all API routes to maintain consistent
 * logging across the entire application.
 */

import { Request, Response, NextFunction } from 'express';
import { logTransaction } from '../services/logServices';

/**
 * Express middleware for logging request and response details
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Record start time for calculating execution duration
  const startTime = Date.now();

  // Capture the original res.json method to log response body later
  const originalJson = res.json.bind(res);
  
  // Override res.json to capture response body before it's sent
  res.json = function (body: any) {
    res.locals.responseBody = body; // Store response body for logging
    return originalJson(body);      // Call original method to continue normal flow
  };

  // Log transaction after response has been sent to client
  res.on('finish', async () => {
    // Calculate how long the request took to process
    const executionTimeMs = Date.now() - startTime;
    
    // Log transaction details to database
    await logTransaction(req, res, executionTimeMs);
  });

  // Continue to next middleware or route handler
  next();
}