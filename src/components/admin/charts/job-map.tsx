import {
  component$,
  useTask$,
  useSignal,
  type PropFunction,
  noSerialize,
  type NoSerialize,
  $,
  isBrowser,
  useContext,
} from "@builder.io/qwik";
import type { MarkerClusterer } from "@googlemaps/markerclusterer";
import logger from "../../../utils/logger";
import { ThemeContext } from "~/contexts/theme";

interface JobLocation {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  salary: string | null;
  type: string | null;
  lat: number;
  lng: number;
}

interface Props {
  jobs: JobLocation[];
  onMarkerClick$?: PropFunction<(jobId: string) => void>;
}

export const JobMap = component$((props: Props) => {
  const themeContext = useContext(ThemeContext);
  const mapContainerRef = useSignal<HTMLDivElement>();
  const map = useSignal<NoSerialize<google.maps.Map> | null>(null);
  const clusterer = useSignal<NoSerialize<MarkerClusterer> | null>(null);

  const updateMarkers = $(async () => {
    if (!map.value) return;

    // Dynamically import MarkerClusterer to avoid SSR issues
    const { MarkerClusterer } = await import("@googlemaps/markerclusterer");

    if (clusterer.value) {
      clusterer.value.clearMarkers();
    }

    const newMarkers: google.maps.Marker[] = [];

    props.jobs.forEach((job) => {
      // Standard Google Maps Marker (Default Red Pin)
      const marker = new window.google.maps.Marker({
        position: { lat: job.lat, lng: job.lng },
        title: job.title,
        // No custom icon -> restores standard pin
        // No animation -> standard behavior
      });

      // ... logo and content logic stays the same ...
      const logoHtml = job.companyLogo
        ? `<img src="${job.companyLogo}" alt="${job.companyName}" class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded w-12 h-12 object-contain">`
        : `<div class="flex justify-center items-center bg-gray-100 dark:bg-black dark:shadow-[0_0_5px_rgba(var(--brand-neon-rgb),0.3)] border border-gray-300 dark:border-brand-neon rounded w-12 h-12 font-mono font-bold text-gray-900 dark:text-brand-neon text-xl">${job.companyName.charAt(0).toUpperCase()}</div>`;

      const typeBadge = job.type
        ? `<span class="inline-block bg-brand-neon/10 px-2 py-0.5 border border-brand-neon/30 rounded font-mono text-[10px] text-emerald-700 dark:text-brand-neon tracking-wide">${job.type.toUpperCase()}</span>`
        : "";

      const salaryHtml = job.salary
        ? `<div class="mt-2 font-mono text-gray-600 dark:text-gray-400 text-xs">${job.salary}</div>`
        : "";

      // InfoWindow Content with Tailwind Classes
      const contentString = `
        <div class="bg-white dark:bg-gray-900 p-2 rounded-lg min-w-[240px] font-sans text-gray-900 dark:text-white">
            <div class="flex items-start gap-3 mb-2.5">
                ${logoHtml}
                <div>
                    <h3 class="m-0 font-bold text-base leading-tight">
                        <a href="/jobs/detail/${job.id}" target="_blank" class="text-gray-900 dark:text-white hover:underline no-underline">${job.title}</a>
                    </h3>
                    <p class="m-0 mt-1 font-mono text-[13px] text-gray-500 dark:text-gray-400">${job.companyName}</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
                    ${typeBadge}
            </div>
            ${salaryHtml}
            <div class="mt-3 pt-2 border-gray-200 dark:border-gray-700 border-t text-right">
                    <a href="/jobs/detail/${job.id}" target="_blank" 
                       class="group inline-flex items-center gap-1 font-mono font-semibold text-[13px] text-emerald-600 dark:text-brand-neon no-underline transition-all"
                    >
                        Vedi Offerta <span class="text-base transition-transform group-hover:translate-x-1">&rarr;</span>
                    </a>
            </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: contentString,
      });

      marker.addListener("click", () => {
        infoWindow.open({
          anchor: marker,
          map: map.value as google.maps.Map,
        });
        if (props.onMarkerClick$) {
          props.onMarkerClick$(job.id);
        }
      });

      newMarkers.push(marker);
    });

    if (!clusterer.value) {
      clusterer.value = noSerialize(
        new MarkerClusterer({
          map: map.value as google.maps.Map,
          markers: newMarkers,
        }),
      );
    } else {
      clusterer.value.addMarkers(newMarkers);
    }
  });

  const initMap = $(() => {
    if (!mapContainerRef.value || !window.google?.maps) return;

    if (!map.value) {
      const italyCenter = { lat: 41.8719, lng: 12.5674 };
      const newMap = new window.google.maps.Map(mapContainerRef.value, {
        center: italyCenter,
        zoom: 5,
        styles: (themeContext.themeState.theme === "dark"
          ? DARK_MAP_STYLES
          : []) as google.maps.MapTypeStyle[],
      });
      map.value = noSerialize(newMap);
    }

    updateMarkers();
  });

  useTask$(({ track, cleanup }) => {
    const container = track(() => mapContainerRef.value);

    if (!isBrowser || !container) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadMap = () => {
      // If Google Maps is ready, initialize
      if (window.google?.maps) {
        initMap();
        return;
      }

      const scriptId = "google-maps-script";
      const existingScript = document.getElementById(scriptId);

      // Function to check and init
      const checkAndInit = () => {
        if (window.google?.maps) {
          if (intervalId) clearInterval(intervalId);
          initMap();
          return true;
        }
        return false;
      };

      if (!existingScript) {
        const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;
        if (!apiKey) {
          logger.error("Missing Google Maps API Key");
          return;
        }
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        // Script exists, poll for google.maps object
        checkAndInit(); // Check once immediately
        intervalId = setInterval(checkAndInit, 100);
      }
    };

    loadMap();

    cleanup(() => {
      if (intervalId) clearInterval(intervalId);
    });
  });

  useTask$(({ track }) => {
    track(() => props.jobs);
    if (isBrowser && map.value) {
      updateMarkers();
    }
  });

  useTask$(({ track }) => {
    const currentTheme = track(() => themeContext.themeState.theme);
    if (isBrowser && map.value) {
      map.value.setOptions({
        styles: currentTheme === "dark" ? DARK_MAP_STYLES : [],
      });
    }
  });

  return (
    <div
      ref={mapContainerRef}
      class="shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl w-full h-[500px]"
    />
  );
});

const DARK_MAP_STYLES = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];
