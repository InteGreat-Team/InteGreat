/**
 * Maps Services
 * 
 * This module provides services for retrieving geographic and location-based information
 * using Google Maps API. It serves as the data access layer for maps-related operations.
 */

import { Client } from '@googlemaps/google-maps-services-js';
import { env } from '../config/env';
import { supabase } from '../config/supabase';

// Initialize Google Maps client
const client = new Client({});

/**
 * Simplified log transaction for service-level logging
 * Compatible with other logging patterns in the application
 */
async function logMapTransaction(action: string, status: string, message: string) {
    try {
      console.log(`📝 LOG: ${action} - ${status} - ${message}`);
      
      // Don't wait for Supabase - fire and forget
      setTimeout(async () => {
        try {
          const { supabase } = await import('../config/supabase');
          
          await supabase
            .from('log_transactions')
            .insert([{
              request_method: 'GET',
              request_url: `/api/maps/${action}`,
              response_status_code: status === 'SUCCESS' ? 200 : 500,
              error_message: status === 'ERROR' ? message : null,
              api_version: '1.0',
              execution_time_ms: 0,
              created_at: new Date().toISOString()
            }]);
        } catch (err) {
          // Just log to console - don't break anything
          console.log('📝 Could not save log to Supabase:', (err as Error).message);
        }
      }, 0);
    } catch (err) {
      // Completely swallow any errors - logging should never break functionality
      console.log('📝 Logging error (handled):', (err as Error).message);
    }
  }

/**
 * Fetch nearby churches using Google Maps Places API
 */
export const getNearbyChurches = async (
  latitude: number, 
  longitude: number,
  radius: number = 5000
) => {
  try {
    console.log(`🔍 Searching for churches near coordinates: ${latitude}, ${longitude} with ${radius}m radius`);
    
    // Query Google Maps Places API
    const response = await client.placesNearby({
      params: {
        location: { lat: latitude, lng: longitude },
        radius: radius,
        type: 'church',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    console.log(`✅ Found ${response.data.results.length} churches in the area`);
    
    // Log successful transaction
    await logMapTransaction('nearby-churches', 'SUCCESS', `Found ${response.data.results.length} churches`);
    
    // Format and return the results
    return response.data.results.map((place) => ({
      name: place.name,
      address: place.vicinity,
      location: place.geometry?.location ?? { lat: 0, lng: 0 },
      place_id: place.place_id,
    }));
  } catch (error) {
    // Handle Google Maps API errors
    console.error('❌ Error fetching nearby churches:', error);
    
    // Log the error with the simplified logger
    await logMapTransaction('nearby-churches', 'ERROR', `Maps API error: ${(error as Error).message}`);
    
    // Rethrow for controller to handle
    throw error;
  }
};