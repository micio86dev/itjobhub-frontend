import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';

interface Props {
  value: string;
  onLocationSelect$: (location: string, coordinates: { lat: number; lng: number }) => void;
  onInput$: (value: string) => void;
  class?: string; // Accept class prop for styling
}

export const LocationAutocomplete = component$((props: Props) => {
  const inputRef = useSignal<HTMLInputElement>();
  
  useVisibleTask$(() => {
    const loadGoogleMaps = () => {
      if (typeof window === 'undefined') return;

      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        // USE ENV VARIABLE FOR API KEY IN PRODUCTION! For now placeholder or user provided key.
        // Assuming user will provide or I use a placeholder.
        // I'll use a placeholder key, user needs to replace it.
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAFGjbJ0u3m8CSodcO9EswM5_CwXY1FdFA&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);
      } else {
        // Script already exists but maybe not loaded yet, or multiple calls
         const checkGoogle = setInterval(() => {
            if (window.google?.maps?.places) {
                clearInterval(checkGoogle);
                initAutocomplete();
            }
         }, 100);
      }
    };

    const initAutocomplete = () => {
      if (!inputRef.value) return;
      
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.value, {
        types: ['(cities)'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
           const lat = place.geometry.location.lat();
           const lng = place.geometry.location.lng();
           const formattedAddress = place.formatted_address || '';
           props.onLocationSelect$(formattedAddress, { lat, lng });
        }
      });
    };

    loadGoogleMaps();
  });

  return (
    <input
      ref={inputRef}
      type="text"
      value={props.value}
      onInput$={(e) => props.onInput$((e.target as HTMLInputElement).value)}
      class={props.class}
      placeholder="City, Country"
    />
  );
});

// Extend window interface to include google
declare global {
  interface Window {
    google: any;
  }
}
