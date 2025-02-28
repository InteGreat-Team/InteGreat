import supabase from '../db/supabaseClient';

// Define an interface for Event Data
export interface EventDetails {
    event_id: number;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    description: string;
}

// Define an interface for Logging Transactions
export interface LogTransaction {
    event_id: number;
    request_type: string;
    response_status: string;
    response_message: string;
    timestamp: string;
}

/**
 * Fetch event details from Supabase and log the transaction
 */
export async function getEventDetails(eventId: number): Promise<EventDetails | null> {
    try {
        console.log(`Fetching event with event_id: ${eventId}`);

        const { data, error } = await supabase
            .from('Events_Table')
            .select('*')
            .eq('event_id', eventId.toString()) // Convert number to string
            .maybeSingle();

        // Log the transaction
        await logTransaction(eventId, 'GET', error ? 'ERROR' : 'SUCCESS', error?.message || 'Event retrieved');

        if (error) {
            console.error('Error fetching event:', error.message);
            return null;
        }

        if (!data) {
            console.log(`No event found with event_id: ${eventId}`);
            return null;
        }

        console.log('Fetched event:', data);
        return data as EventDetails;
    } catch (error) {
        console.error('Unexpected error:', error);
        await logTransaction(eventId, 'GET', 'ERROR', 'Unexpected error occurred');
        return null;
    }
}

/**
 * Log API transactions to Supabase
 */
export async function logTransaction(
    eventId: number,
    requestType: string,
    responseStatus: string,
    responseMessage: string
): Promise<void> {
    try {
        console.log(`🔹 Logging transaction for Event ID: ${eventId}`);

        const { error } = await supabase.from('Log_Transactions').insert([
            {
                event_id: eventId, // Keep this
                request_type: requestType,
                response_status: responseStatus,
                response_message: responseMessage,
                timestamp: new Date().toISOString(), // Supabase should handle this if set to default NOW()
            },
        ]);

        if (error) {
            console.error('❌ Error logging transaction:', error.message);
        } else {
            console.log(`✅ Transaction logged successfully for event_id: ${eventId}`);
        }
    } catch (error) {
        console.error('❌ Unexpected error while logging transaction:', error);
    }
}

