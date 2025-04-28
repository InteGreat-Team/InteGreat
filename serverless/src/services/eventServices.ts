/**
 * Event Services
 * 
 * This module provides services for retrieving event information from the database
 * and logging transaction details. It serves as the data access layer for event-related
 * operations.
 * 
 * Key Components:
 * - Event Retrieval: Fetches event details from Supabase
 * - Transaction Logging: Records API operations and their results
 * - Error Handling: Manages database errors and unexpected exceptions
 * 
 * Features:
 * - Robust Logging: Captures success and failure states
 * - Type Safety: Uses TypeScript interfaces for database records
 * - Detailed Console Output: Provides visibility into operations
 * - Transaction Recording: Maintains audit trail of all operations
 */

import { supabase } from '../config/supabase';
import { EventDetails } from '../types/eventTypes';
import { LogTransaction } from '../types/logTypes';

/**
 * Fetch event details from Supabase and log the transaction
 * 
 * @param eventId - Numeric identifier of the event to retrieve
 * @returns Promise<EventDetails | null> - Event details if found, null otherwise
 */
export async function getEventDetails(eventId: number): Promise<EventDetails | null> {
    try {
        console.log(`Fetching event with event_id: ${eventId}`);

        // Query Supabase for event data
        const { data, error } = await supabase
            .from('Events_Table')
            .select('*')
            .eq('event_id', eventId.toString()) // Convert number to string
            .maybeSingle();

        // Log transaction regardless of outcome
        await logTransaction(
            eventId, 
            'GET', 
            error ? 'ERROR' : 'SUCCESS', 
            error?.message || 'Event retrieved'
        );

        // Handle database errors
        if (error) {
            console.error('Error fetching event:', error.message);
            return null;
        }

        // Handle missing data case
        if (!data) {
            console.log(`No event found with event_id: ${eventId}`);
            return null;
        }

        console.log('Fetched event:', data);
        return data as EventDetails;
    } catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error:', error);
        await logTransaction(eventId, 'GET', 'ERROR', 'Unexpected error occurred');
        return null;
    }
}

/**
 * Log API transactions to Supabase
 * 
 * @param eventId - ID of the event related to this transaction
 * @param requestType - Type of request (GET, POST, PUT, DELETE, etc.)
 * @param responseStatus - Outcome status (SUCCESS, ERROR)
 * @param responseMessage - Detailed message about the transaction
 * @returns Promise<void>
 */
export async function logTransaction(
    eventId: number,
    requestType: string,
    responseStatus: string,
    responseMessage: string
): Promise<void> {
    try {
        console.log(`🔹 Logging transaction for Event ID: ${eventId}`);

        // Insert transaction record into Supabase
        const { error } = await supabase.from('log_transactions').insert([
            {
                event_id: eventId,
                request_type: requestType,
                response_status: responseStatus,
                response_message: responseMessage,
                timestamp: new Date().toISOString(), // Supabase should handle this if set to default NOW()
            },
        ]);

        // Log outcome of the logging operation itself
        if (error) {
            console.error('❌ Error logging transaction:', error.message);
        } else {
            console.log(`✅ Transaction logged successfully for event_id: ${eventId}`);
        }
    } catch (error) {
        console.error('❌ Unexpected error while logging transaction:', error);
    }
}