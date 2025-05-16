import { PlaceType1 } from '@googlemaps/google-maps-services-js';

export type LocationParam =
  | string
  | { latitude: number; longitude: number };

export type PlacesParams =
  | {
      operation: "NEARBY_SEARCH";
      location: LocationParam;
      radius: number;
      type?: PlaceType1;
      keyword?: string;
      name?: string;
    }
  | {
      operation: "TEXT_SEARCH";
      query: string;
      location?: LocationParam;
      radius?: number;
      type?: PlaceType1;
      keyword?: string;
      name?: string;
    };