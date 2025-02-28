import supabase from '../db/supabaseClient';
import { Request, Response } from 'express';

/**
 * Logs API transactions into Supabase
 */
export async function logTransaction(
    req: Request,
    res: Response,
    executionTimeMs: number,
    errorMessage: string | null = null
) {
    try {
        const requestMethod = req.method;
        const requestUrl = req.originalUrl;
        const requestHeaders = JSON.stringify(req.headers);
        const requestBody = req.body ? JSON.stringify(req.body) : null;
        const responseStatusCode = res.statusCode;
        const responseBody = res.locals.responseBody ? JSON.stringify(res.locals.responseBody) : null;
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const apiVersion = '1.0';

        console.log('🚀 Attempting to log request to Supabase...');

        // Insert into Supabase
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
            .select(); // Select ensures we get a response from Supabase

        if (error) {
            console.error('❌ Supabase Error:', error);
        } else {
            console.log('✅ Transaction logged successfully:', data);
        }
    } catch (err) {
        console.error('❌ Unexpected error while logging:', err);
    }
}
