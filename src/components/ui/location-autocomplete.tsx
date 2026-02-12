import {
  component$,
  useSignal,
  useTask$,
  isBrowser,
  PropFunction,
  $,
  useServerData,
} from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";
import { createGoogleMapsPolicy } from "~/utils/trusted-types";

interface Props {
  value: string;
  onLocationSelect$: PropFunction<
    (location: string, coordinates: { lat: number; lng: number }) => void
  >;
  onInput$: PropFunction<(value: string) => void>;
  class?: string;
}

const GOOGLE_MAPS_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;

export const LocationAutocomplete = component$((props: Props) => {
  const inputRef = useSignal<HTMLInputElement | undefined>();
  const t = useTranslate();

  const initAutocomplete = $(() => {
    if (!inputRef.value || !window.google?.maps?.places) return;
    if (inputRef.value.dataset.gmapsInit === "true") return;

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

  // Capture env var and nonce at component level
  const nonce = useServerData<string | undefined>("nonce");

  const loadScript = $(() => {
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    const scriptId = "google-maps-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      // Script already loading/loaded, poll
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          initAutocomplete();
        }
      }, 100);
      return;
    }

    if (!GOOGLE_MAPS_KEY) {
      console.error("LocationAutocomplete: Missing API Key");
      return;
    }

    // Define global callback to avoid console errors
    window.initGoogleMapsCallback = () => {
      // API loaded, now wait for places lib if needed (though it should be included)
      if (window.google?.maps?.places) {
        initAutocomplete();
      }
    };

    const script = document.createElement("script");
    script.id = scriptId;

    // Add callback and loading=async parameters
    const src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&loading=async&callback=initGoogleMapsCallback`;

    const policy = createGoogleMapsPolicy();
    if (policy) {
      script.src = policy.createScriptURL(src) as string;
    } else {
      script.src = src;
    }

    if (nonce) {
      script.setAttribute("nonce", nonce);
    }
    script.async = true;
    // Keep onload as fallback/redundancy
    script.onload = () => {
      // Check if callback already handled it
      if (window.google?.maps?.places && !inputRef.value?.dataset.gmapsInit) {
        initAutocomplete();
      }
    };
    document.head.appendChild(script);
  });

  // Track the input element's presence on the client
  useTask$(({ track }) => {
    const input = track(() => inputRef.value);
    if (isBrowser && input) {
      if (!GOOGLE_MAPS_KEY) {
        console.error("LocationAutocomplete: Missing PUBLIC_GOOGLE_MAPS_KEY");
        // Visual indication for developers/users that the key is missing
        input.placeholder = "Error: Missing Maps API Key";
        input.style.borderColor = "red";
        return;
      }
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
      onFocus$={() => {
        if (GOOGLE_MAPS_KEY) {
          loadScript();
        }
      }}
      class={props.class}
      placeholder={t("common.city_country_placeholder")}
      autoComplete="off"
    />
  );
});
