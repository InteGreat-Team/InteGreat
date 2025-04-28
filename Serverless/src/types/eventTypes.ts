/**
 * Event Types
 * 
 * This module defines TypeScript interfaces related to events and their properties.
 * These types ensure consistent data structures throughout the application and
 * provide type safety for database operations and API responses.
 * 
 * Key Components:
 * - EventDetails: Represents the structure of an event record in the database
 * 
 * These types are used by services, controllers, and route handlers to maintain
 * consistent data modeling across the application stack.
 */

/**
 * EventDetails interface
 * 
 * Represents an event stored in the database.
 * Maps directly to columns in the Events_Table in Supabase.
 * 
 * Properties:
 * - event_id: Unique identifier for the event
 * - name: Name or title of the event
 * - date: Date when the event occurs (YYYY-MM-DD format)
 * - start_time: Start time of the event (HH:MM format)
 * - end_time: End time of the event (HH:MM format)
 * - location: Physical or virtual location where the event takes place
 * - description: Detailed description of the event
 */
export interface EventDetails {
    event_id: number;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    description: string;
}