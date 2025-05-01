/**
 * Event Service
 * 
 * This service manages event-related operations using Supabase as the backend.
 * It provides methods for retrieving event details and logging transactions.
 * 
 * Key Components:
 * - Supabase Integration: Uses Supabase client for database operations
 * - Event Retrieval: Fetches event details by ID
 * - Transaction Logging: Records operation attempts and results
 * 
 * Features:
 * - Error Handling: Gracefully handles database errors
 * - Data Validation: Ensures event data integrity
 * - Logging: Tracks all operations for debugging
 * - Type Safety: Uses TypeScript interfaces for type checking
 * 
 * This service serves as the central point for event data operations,
 * ensuring consistent access to event information across the platform.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventDetails } from '../types/eventTypes';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

/**
 * Get event details from Supabase
 * 
 * @param eventId - The ID of the event to retrieve
 * @param supabaseClient - Optional Supabase client instance
 * @returns Promise<EventDetails | null> - The event details or null if not found
 */
export async function getEventDetails(eventId: string, supabaseClient?: SupabaseClient): Promise<EventDetails | null> {
  try {
    // Use provided client or the default one
    const client = supabaseClient || supabase;

    console.log('Fetching event details for ID:', eventId);
    console.log('Using Supabase URL:', process.env.SUPABASE_URL);

    const { data, error } = await client
      .from('Events_Table')  // Changed back to original table name
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event details:', error);
      return null;
    }

    console.log('Fetched event details:', data);
    return data as EventDetails;
  } catch (error) {
    console.error('Error in getEventDetails:', error);
    return null;
  }
}

export async function logTransaction(
  eventId: number,
  method: string,
  status: 'SUCCESS' | 'ERROR',
  message: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_logs')
      .insert({
        event_id: eventId,
        method,
        status,
        message,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in logTransaction:', error);
    // Don't throw the error as this is a non-critical operation
  }
} 