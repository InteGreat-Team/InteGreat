/**
 * Log Services
 * 
 * This service handles API transaction logging to Supabase for monitoring, 
 * debugging, and audit purposes. It captures comprehensive details about
 * each request and response processed by the API.
 * 
 * Key Components:
 * - Request Capture: Records HTTP method, URL, headers, and body
 * - Response Capture: Records status code and response body
 * - Performance Metrics: Tracks execution time for performance monitoring
 * - Client Information: Logs IP address for security auditing
 * - Versioning: Includes API version for compatibility tracking
 * 
 * Features:
 * - Robust Error Handling: Ensures logging failures don't impact API operations
 * - Data Sanitization: Safely converts complex objects to JSON
 * - Detailed Console Output: Provides visibility into logging operations
 * - Graceful Fallbacks: Uses alternative sources for client IP when primary is unavailable
 * - Timeout Protection: Prevents logging operations from hanging the main process
 * 
 * This service is used by the requestLogger middleware to maintain a comprehensive
 * audit trail of all API operations.
 */

import { supabase } from '../config/supabase';
import { Request, Response } from 'express';

// Logging timeout in milliseconds
const LOG_TIMEOUT_MS = 1500;

/**
 * Logs API transactions into Supabase with timeout protection
 * 
 * @param req - Express request object containing request details
 * @param res - Express response object containing response details
 * @param executionTimeMs - Time taken to process the request in milliseconds
 * @param errorMessage - Optional error message if request processing failed
 * @returns Promise<void>
 */
export async function logTransaction(
  req: Request,
  res: Response,
  executionTimeMs: number,
  errorMessage: string | null = null
) {
  try {
    // Extract request details
    const requestMethod = req.method;
    const requestUrl = req.originalUrl;
    const requestHeaders = JSON.stringify(req.headers);
    const requestBody = req.body ? JSON.stringify(req.body) : null;
    
    // Extract response details
    const responseStatusCode = res.statusCode;
    const responseBody = res.locals.responseBody ? JSON.stringify(res.locals.responseBody) : null;
    
    // Determine client IP using various fallback options
    const clientIp = req.ip || 
                     req.headers['x-forwarded-for'] || 
                     (req.connection && req.connection.remoteAddress) || 
                     'unknown';
    
    // Set API version for tracking
    const apiVersion = '1.0';

    console.log('🚀 Attempting to log request to Supabase...');

    // Use non-blocking approach with timeout protection
    const logPromise = new Promise(async (resolve) => {
      try {
        // Insert transaction record into Supabase
        const { data, error } = await supabase
          .from('log_transactions')
          .insert([
            {
              request_method: requestMethod,
              request_url: requestUrl,
              request_headers: requestHeaders,
              request_body: requestBody,
              response_status_code: responseStatusCode,
              response_body: responseBody,
              client_ip: clientIp,
              execution_time_ms: executionTimeMs,
              error_message: errorMessage,
              api_version: apiVersion,
            },
          ])
          .select(); // Using .select() to get the inserted row back

        // Handle database operation result
        if (error) {
          console.error('❌ Supabase Error:', error);
        } else {
          console.log('✅ Transaction logged successfully');
        }
      } catch (innerErr) {
        console.error('❌ Supabase operation error:', innerErr);
      }
      resolve(true); // Always resolve to prevent hanging
    });
    
    // Set a timeout to ensure we don't wait too long
    await Promise.race([
      logPromise,
      new Promise(resolve => setTimeout(() => {
        console.log('⏱️ Logging timeout reached - continuing execution');
        resolve(false);
      }, LOG_TIMEOUT_MS))
    ]);
    
  } catch (err) {
    // Ensure logging errors don't propagate
    console.error('❌ Unexpected error while logging:', err);
  }
}

/**
 * Simplified log transaction for non-request contexts (e.g., background processes)
 * 
 * @param eventId - Associated event ID (0 for system events)
 * @param requestType - HTTP method or operation type
 * @param responseStatus - Status of the operation (SUCCESS/ERROR)
 * @param responseMessage - Details about the operation result
 * @returns Promise<void>
 */
export async function logSimpleTransaction(
  eventId: number,
  requestType: string,
  responseStatus: string,
  responseMessage: string
) {
  try {
    console.log(`📝 LOG: ${requestType} - ${responseStatus} - ${responseMessage}`);
    
    // Use non-blocking approach with timeout protection
    const logPromise = new Promise(async (resolve) => {
      try {
        const { error } = await supabase
          .from('log_transactions')
          .insert([{
            event_id: eventId,
            request_type: requestType,
            response_status: responseStatus,
            response_message: responseMessage,
            timestamp: new Date().toISOString()
          }]);
          
        if (error) {
          console.error('❌ Simplified logging error:', error);
        }
      } catch (innerErr) {
        console.error('❌ Simplified logging exception:', innerErr);
      }
      resolve(true); // Always resolve to prevent hanging
    });
    
    // Set a timeout to ensure we don't wait too long
    await Promise.race([
      logPromise,
      new Promise(resolve => setTimeout(() => {
        console.log('⏱️ Simplified logging timeout reached');
        resolve(false);
      }, LOG_TIMEOUT_MS))
    ]);
  } catch (err) {
    // Completely swallow any errors - logging should never break functionality
    console.error('❌ Logging wrapper error:', err);
  }
}