import {
  component$,
  useSignal,
  useTask$,
  isBrowser,
  PropFunction,
  $,
} from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

interface Props {
  value: string;
  onLocationSelect$: PropFunction<
    (location: string, coordinates: { lat: number; lng: number }) => void
  >;
  onInput$: PropFunction<(value: string) => void>;
  class?: string;
}

export const LocationAutocomplete = component$((props: Props) => {
  const inputRef = useSignal<HTMLInputElement | undefined>();
  const t = useTranslate();

  const initAutocomplete = $(() => {
    if (!inputRef.value || !window.google?.maps?.places) return;
    if (inputRef.value.dataset.gmapsInit === "true") return;

    console.log("LocationAutocomplete: Initializing");
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.value,
      {
        types: ["(cities)"],
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || "";
        props.onLocationSelect$(formattedAddress, { lat, lng });
      }
    });

    inputRef.value.dataset.gmapsInit = "true";
  });

  const loadScript = $(() => {
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      // Script already loading/loaded, poll
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          initAutocomplete();
        }
      }, 100);
      return;
    }

    const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      console.error("LocationAutocomplete: Missing API Key");
      return;
    }

    console.log("LocationAutocomplete: Script loading started");
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      console.log("LocationAutocomplete: Script onload hit");
      initAutocomplete();
    };
    document.head.appendChild(script);
  });

  // Track the input element's presence on the client
  useTask$(({ track }) => {
    const input = track(() => inputRef.value);
    if (isBrowser && input) {
      console.log("LocationAutocomplete: Client-side task active");
      loadScript();
    }
  });

  return (
    <input
      ref={inputRef}
      type="text"
      value={props.value}
      onInput$={(e) => {
        props.onInput$((e.target as HTMLInputElement).value);
      }}
      onFocus$={loadScript} // Fallback to ensure loading if task misses
      class={props.class}
      placeholder={t("common.city_country_placeholder")}
      autoComplete="off"
    />
  );
});
