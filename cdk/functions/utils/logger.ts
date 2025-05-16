// functions/utils/logger.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyEventHeaders } from 'aws-lambda';
import { jwtDecode } from 'jwt-decode';
import { logTransaction } from '../../shared/services/logServices';

interface CustomJwtPayload {
  aud?: string;
  role?: string;
  custom_claim?: string;
  [key: string]: any;
}

const LOG_TIMEOUT_MS = 1500;

// Convert Lambda headers to Record<string, string>
function convertHeaders(headers: APIGatewayProxyEventHeaders = {}): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// Helper to get header value case-insensitively
function getHeaderCaseInsensitive(headers: Record<string, string | undefined>, key: string): string | null {
  const foundKey = Object.keys(headers).find(
    k => k.toLowerCase() === key.toLowerCase()
  );
  return foundKey ? headers[foundKey] || null : null;
}

async function logTransactionLambda(
  event: APIGatewayProxyEvent,
  response: APIGatewayProxyResult,
  executionTimeMs: number,
  errorMessage: string | null = null
) {
  // Debug logging to help diagnose missing headers and IP
  console.log('DEBUG: event.headers:', JSON.stringify(event.headers, null, 2));
  console.log('DEBUG: event.requestContext:', JSON.stringify(event.requestContext, null, 2));

  let origin: string | null = null;
  let role: string | null = null;

  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.trim().toLowerCase().startsWith('bearer ')) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[1]) {
        const token = parts[1];
        const decoded = jwtDecode<CustomJwtPayload>(token);
        origin = decoded.aud?.split('-')[0] || null;
        role = decoded.role || decoded.custom_claim || null;
        console.log('Decoded JWT:', decoded);
      } else {
        console.warn('Authorization header is malformed, missing token part:', authHeader);
      }
    }
  } catch (err) {
    console.warn('JWT decode error:', err);
  }

  const pathSegments = event.path.split('/').filter(Boolean);
  const destination = pathSegments[0]
    ? pathSegments[0][0].toUpperCase() + pathSegments[0].slice(1).toLowerCase()
    : 'UNKNOWN';

  const req = {
    method: event.httpMethod,
    originalUrl: event.path,
    headers: convertHeaders(event.headers),
    body: event.body || null,
    origin,
    role,
    destination,
    country: getHeaderCaseInsensitive(event.headers || {}, 'cloudfront-viewer-country-name') || null,
    region: getHeaderCaseInsensitive(event.headers || {}, 'cloudfront-viewer-country-region-name') || null,
    city: getHeaderCaseInsensitive(event.headers || {}, 'cloudfront-viewer-city') || null,
    zip_code: getHeaderCaseInsensitive(event.headers || {}, 'cloudfront-viewer-postal-code') || null,
    latitude: getHeaderCaseInsensitive(event.headers || {}, 'cloudfront-viewer-latitude') || null,
    longitude: getHeaderCaseInsensitive(event.headers || {}, 'cloudfront-viewer-longitude') || null,
  };

  const res = {
    statusCode: response.statusCode,
    locals: { responseBody: response.body }
  };

  try {
    await Promise.race([
      logTransaction(req, res, executionTimeMs, errorMessage),
      new Promise(r => setTimeout(r, LOG_TIMEOUT_MS))
    ]);
  } catch (error) {
    console.error('Error logging transaction:', error);
  }
}

// For backward compatibility with existing code
export class Logger {
  private static instance: Logger;

  public static async getInstance(): Promise<Logger> {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public async logRequest(service: string, event: APIGatewayProxyEvent, startTime: number): Promise<void> {
    await logTransactionLambda(event, { statusCode: 200, body: '' }, Date.now() - startTime);
  }

  public async logResponse(service: string, event: APIGatewayProxyEvent, response: APIGatewayProxyResult, startTime: number): Promise<void> {
    await logTransactionLambda(event, response, Date.now() - startTime);
  }

  public async logError(service: string, event: APIGatewayProxyEvent, error: any, startTime: number): Promise<void> {
    await logTransactionLambda(event, { statusCode: 500, body: '' }, Date.now() - startTime, error.message);
  }
}

export const loggerMiddleware = () => ({
  before: (handler: any, next: () => void) => {
    handler.context._startTime = Date.now();
    next();
  },

  after: async (handler: any, next: () => void) => {
    const ms = Date.now() - handler.context._startTime;
    await Promise.race([
      logTransactionLambda(handler.event, handler.response, ms),
      new Promise(r => setTimeout(r, LOG_TIMEOUT_MS))
    ]).catch(console.error);
    next();
  },

  onError: async (handler: any, next: (error?: any) => void) => {
    const ms = Date.now() - handler.context._startTime;
    await Promise.race([
      logTransactionLambda(handler.event, handler.response || {}, ms, handler.error.message),
      new Promise(r => setTimeout(r, LOG_TIMEOUT_MS))
    ]).catch(console.error);
    next(handler.error);
  }
});