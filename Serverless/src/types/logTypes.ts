/**
 * Log Types
 * 
 * This module defines TypeScript interfaces related to logging and transaction tracking.
 * These types ensure consistent data structures for monitoring API operations and
 * provide type safety for database logging operations.
 * 
 * Key Components:
 * - LogTransaction: Represents the structure of a transaction log record in the database
 * 
 * These types are used by services and middleware to maintain consistent
 * logging formats across the application.
 */

/**
 * LogTransaction interface
 * 
 * Represents a transaction log entry stored in the database.
 * Maps directly to columns in the log_transactions table in Supabase.
 * 
 * Properties:
 * - event_id: ID of the event related to this transaction
 * - request_type: Type of HTTP request (GET, POST, PUT, DELETE)
 * - response_status: Outcome status of the operation (SUCCESS, ERROR)
 * - response_message: Detailed description of the transaction result
 * - timestamp: ISO-formatted date and time when the transaction occurred
 */
export interface LogTransaction {
    event_id: number;
    request_type: string;
    response_status: string;
    response_message: string;
    timestamp: string;
}