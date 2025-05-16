/**
 * Geolocation Service using Google Maps Services Node.js Client
 *
 * Provides methods for interacting with Google Maps Geolocation APIs:
 * - getRoutes: Directions, distance, and travel time
 * - getNearbyPlaces: Nearby Search
 * - textSearch: Text-based place search
 * - geocode: Forward geocoding (address → coordinates)
 * - reverseGeocode: Reverse geocoding (coordinates → address)
 *
 * Built on @googlemaps/google-maps-services-js for type safety, retry logic, and streamlined parameter handling.
 */

import { Client, Status } from '@googlemaps/google-maps-services-js';
import { RoutesParams } from '../types/routesTypes';
import { GeocodingParams, ReverseGeocodingParams } from '../types/geocodeTypes';
import { PlacesParams } from '../types/placesTypes';

export class GeolocationService {
  private client: Client;
  private apiKey: string;

  /**
   * Initializes the service with the Google Maps API key.
   * @param apiKey - Your Google Maps API key (from env or config)
   */
  constructor(apiKey: string = process.env.GOOGLE_MAPS_API_KEY!) {
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY must be set in environment');
    }
    this.client = new Client({});
    this.apiKey = apiKey;
    console.log('✅ GeolocationService initialized');
  }

  /**
   * Calculate directions between two points.
   */
  async getRoutes(params: RoutesParams) {
    const res = await this.client.directions({
      params: {
        origin: params.origin,
        destination: params.destination,
        key: this.apiKey,
      }
    });
    if (res.data.status !== Status.OK) throw new Error(res.data.error_message || 'Directions error');
    return res.data;
  }

  /**
   * Perform nearby search or text search based on operation.
   */
  async getPlaces(params: PlacesParams) {
    if (params.operation === 'NEARBY_SEARCH') {
      const loc = typeof params.location === 'string'
        ? params.location
        : `${params.location.latitude},${params.location.longitude}`;
      
      // Create request parameters
      const requestParams: any = {
        location: loc,
        radius: params.radius,
        key: this.apiKey,
      };
      
      // Only add optional parameters if they exist
      if (params.type) requestParams.type = params.type;
      if (params.keyword) requestParams.keyword = params.keyword;
      if (params.name) requestParams.name = params.name;
      
      const res = await this.client.placesNearby({
        params: requestParams
      });
      
      return res.data;
    } else {
      // TEXT_SEARCH
      // Create base request parameters
      const requestParams: any = {
        query: params.query,
        key: this.apiKey,
      };
      
      // Only add location if it exists
      if (params.location) {
        const loc = typeof params.location === 'string'
          ? params.location
          : `${params.location.latitude},${params.location.longitude}`;
        requestParams.location = loc;
      }
      
      // Add other optional parameters if they exist
      if (params.radius) requestParams.radius = params.radius;
      if (params.type) requestParams.type = params.type;
      
      // Note: The Google Maps client doesn't accept 'keyword' or 'name' for textSearch
      // These fields are specific to our API but not supported by the Google Maps client
      
      const res = await this.client.textSearch({
        params: requestParams
      });
      
      return res.data;
    }
  }

  /**
   * Forward geocode an address.
   */
  async geocode(params: GeocodingParams) {
    const res = await this.client.geocode({
      params: {
        address: params.address,
        key: this.apiKey,
      }
    });
    return res.data;
  }

  /**
   * Reverse geocode coordinates to an address.
   */
  async reverseGeocode(params: ReverseGeocodingParams) {
    const res = await this.client.reverseGeocode({
      params: {
        latlng: `${params.lat},${params.lng}`,
        key: this.apiKey,
      }
    });
    return res.data;
  }
}