import {
  component$,
  useSignal,
  useVisibleTask$,
  PropFunction,
} from "@builder.io/qwik";
import logger from "../../utils/logger";
import { useTranslate } from "~/contexts/i18n";

interface Props {
  value: string;
  onLocationSelect$: PropFunction<
    (location: string, coordinates: { lat: number; lng: number }) => void
  >;
  onInput$: PropFunction<(value: string) => void>;
  class?: string; // Accept class prop for styling
}

export const LocationAutocomplete = component$((props: Props) => {
  const inputRef = useSignal<HTMLInputElement>();
  const t = useTranslate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    const input = track(() => inputRef.value);

    if (!input) return;

    let intervalId: NodeJS.Timeout;

    const initAutocomplete = () => {
      if (!input || !window.google?.maps?.places) return;

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["(cities)"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address || "";
          props.onLocationSelect$(formattedAddress, { lat, lng });
        }
      });
    };

    const loadGoogleMaps = () => {
      // Direct check
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      const scriptId = "google-maps-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;
        if (!apiKey) {
          logger.error("Google Maps API key is missing");
          return;
        }
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);
      } else {
        // Polling if script exists but not loaded
        intervalId = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(intervalId);
            initAutocomplete();
          }
        }, 100);
      }
    };

    loadGoogleMaps();

    cleanup(() => {
      if (intervalId) clearInterval(intervalId);
      // We could also remove listeners if we kept a ref to autocomplete instance,
      // but Google Maps instances attached to DOM elements usually get cleaned up
      // when the DOM element is removed.
    });
  });

  return (
    <input
      ref={inputRef}
      type="text"
      value={props.value}
      onInput$={(e) => props.onInput$((e.target as HTMLInputElement).value)}
      class={props.class}
      placeholder={t("common.city_country_placeholder")}
    />
  );
});
