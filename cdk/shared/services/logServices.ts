// services/logServices.ts
import { neon } from '@neondatabase/serverless';

interface RequestData {
  method: string;
  originalUrl: string;
  headers: Record<string, string>;
  body: any;
  origin: string | null;
  role: string | null;
  destination: string;
  country: string | null;
  region: string | null;
  city: string | null;
  zip_code: string | null;
  latitude: string | null;
  longitude: string | null;
}

interface ResponseData {
  statusCode: number;
  locals: {
    responseBody: any;
  };
}

const sql = neon(process.env.NEON_DB_URL!);

export async function logTransaction(
  req: RequestData,
  res: ResponseData,
  executionTimeMs: number,
  errorMessage: string | null = null
) {
  try {
    await sql`
      INSERT INTO "OLTP".api_transactions (
        created_at,
        request_method,
        request_url,
        request_headers,
        request_body,
        response_status_code,
        response_body,
        origin,
        role,
        destination,
        country,
        region,
        city,
        zip_code,
        latitude,
        longitude,
        execution_time_ms,
        error_message,
        api_version
      ) VALUES (
        NOW(),
        ${req.method},
        ${req.originalUrl},
        ${JSON.stringify(req.headers)},
        ${req.body ? JSON.stringify(req.body) : null},
        ${res.statusCode},
        ${res.locals.responseBody ? JSON.stringify(res.locals.responseBody) : null},
        ${req.origin},
        ${req.role},
        ${req.destination},
        ${req.country},
        ${req.region},
        ${req.city},
        ${req.zip_code},
        ${req.latitude ? parseFloat(req.latitude) : null},
        ${req.longitude ? parseFloat(req.longitude) : null},
        ${executionTimeMs},
        ${errorMessage},
        '1.0'
      )
    `;
  } catch (err) {
    console.error('❌ NeonDB HTTP logTransaction error:', err);
  }
} 