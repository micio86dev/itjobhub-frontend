export {};

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
        Marker: new (options: GoogleMarkerOptions) => GoogleMarker;
        InfoWindow: new (options: GoogleInfoWindowOptions) => GoogleInfoWindow;
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: GoogleAutocompleteOptions,
          ) => GoogleAutocomplete;
        };
        event: {
          addListener: (
            instance: unknown,
            eventName: string,
            handler: (...args: unknown[]) => void,
          ) => void;
        };
        LatLngBounds: new () => GoogleLatLngBounds;
        Animation: {
          DROP: number;
        };
        Point: new (x: number, y: number) => GooglePoint;
      };
    };
  }

  interface GoogleMapOptions {
    center: { lat: number; lng: number };
    zoom: number;
    styles?: unknown[];
  }

  interface GoogleMarkerOptions {
    position: { lat: number; lng: number };
    map: GoogleMap | null;
    title?: string;
    animation?: number;
    icon?:
      | string
      | {
          path: string;
          fillColor?: string;
          fillOpacity?: number;
          strokeColor?: string;
          strokeWeight?: number;
          scale?: number;
          anchor?: GooglePoint;
          rotation?: number;
        };
  }

  interface GooglePoint {
    x: number;
    y: number;
    equals: (other: GooglePoint) => boolean;
  }

  interface GoogleInfoWindowOptions {
    content: string;
  }

  interface GoogleMap {
    setCenter: (latLng: { lat: number; lng: number }) => void;
    setZoom: (zoom: number) => void;
    fitBounds: (bounds: GoogleLatLngBounds) => void;
  }

  interface GoogleMarker {
    setMap: (map: GoogleMap | null) => void;
    getPosition: () => { lat: () => number; lng: () => number };
    addListener: (event: string, handler: (...args: unknown[]) => void) => void;
  }

  interface GoogleAutocompleteOptions {
    types?: string[];
    fields?: string[];
  }

  interface GoogleAutocomplete {
    addListener: (event: string, handler: () => void) => void;
    getPlace: () => GooglePlaceResult;
  }

  interface GooglePlaceResult {
    formatted_address?: string;
    geometry?: {
      location: {
        lat: () => number;
        lng: () => number;
      };
    };
  }

  interface GoogleInfoWindow {
    open: (options: { anchor?: GoogleMarker; map: GoogleMap }) => void;
    setContent: (content: string) => void;
    close: () => void;
  }

  interface GoogleLatLngBounds {
    extend: (latLng: { lat: number; lng: number }) => void;
  }
}
