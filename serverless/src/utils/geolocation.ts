/**
 * Geolocation Utilities
 * 
 * This module provides utilities for accessing and working with the browser's
 * geolocation services. It offers functions to retrieve the user's current
 * geographic coordinates for location-aware features.
 * 
 * Features:
 * - Promise-based geolocation access
 * - Error handling for unsupported browsers
 * - Configurable accuracy and timeout settings
 * - Type-safe coordinate return values
 */

/**
 * Gets the user's current geographic location
 * 
 * Uses the browser's Geolocation API to retrieve the user's current position.
 * Returns a Promise that resolves with latitude and longitude coordinates.
 * 
 * @returns Promise<{lat: number, lng: number}> - Object containing latitude and longitude
 * @throws Error if geolocation is unsupported or permission is denied
 */
export const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      // Check if the browser supports geolocation
      if ("geolocation" in navigator) {
        // Request the current position from the browser
        navigator.geolocation.getCurrentPosition(
          // Success callback
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          // Error callback
          (error) => {
            reject(new Error(`Geolocation error: ${error.message}`));
          },
          // Options for the geolocation request
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        // Browser doesn't support geolocation
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  };