import {
  component$,
  useTask$,
  useSignal,
  PropFunction,
  noSerialize,
  NoSerialize,
  $,
  useOn,
  isBrowser,
} from "@builder.io/qwik";
import logger from "../../../utils/logger";

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
  const mapContainerRef = useSignal<HTMLDivElement>();
  const map = useSignal<NoSerialize<GoogleMap> | null>(null);
  const markers = useSignal<NoSerialize<GoogleMarker>[]>([]);

  const updateMarkers = $(() => {
    if (!map.value) return;

    // Clear existing markers
    markers.value.forEach((m) => m?.setMap(null));
    const newMarkers: GoogleMarker[] = [];

    props.jobs.forEach((job) => {
      // IT Style Marker (Terminal/Code cursor style)
      const markerIcon = {
        path: "M4 17l6-6-6-6M12 19h8", // Terminal command prompt-like path
        strokeColor: "#00FF41", // Matrix Green / Brand Neon
        strokeWeight: 3,
        scale: 1.5,
        anchor: new window.google.maps.Point(10, 10),
      };

      const marker = new window.google.maps.Marker({
        map: map.value as GoogleMap,
        position: { lat: job.lat, lng: job.lng },
        title: job.title,
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP,
      });

      // Placeholder/Logo logic - Styled for Dark Mode/IT Theme
      const logoHtml = job.companyLogo
        ? `<img src="${job.companyLogo}" alt="${job.companyName}" style="width: 48px; height: 48px; border-radius: 4px; object-fit: contain; background: #111827; border: 1px solid #374151;">`
        : `<div style="width: 48px; height: 48px; border-radius: 4px; background: #000000; color: #00FF41; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: monospace; border: 1px solid #00FF41; box-shadow: 0 0 5px rgba(0, 255, 65, 0.3); font-size: 20px;">${job.companyName.charAt(0).toUpperCase()}</div>`;

      const typeBadge = job.type
        ? `<span style="background: rgba(0, 255, 65, 0.1); color: #00FF41; font-size: 10px; padding: 2px 8px; border-radius: 2px; font-family: monospace; border: 1px solid rgba(0, 255, 65, 0.3); letter-spacing: 0.5px;">${job.type.toUpperCase()}</span>`
        : "";
      const salaryHtml = job.salary
        ? `<div style="margin-top: 8px; font-size: 12px; color: #e5e7eb; font-family: monospace;">${job.salary}</div>`
        : "";

      // Dark Mode InfoWindow Content
      const contentString = `
        <div style="
            padding: 8px; 
            min-width: 240px; 
            font-family: system-ui, -apple-system, sans-serif; 
            background: #111827; 
            color: #fff;
            border-radius: 8px;
        ">
            <div style="display: flex; gap: 12px; align-items: start; margin-bottom: 10px;">
                ${logoHtml}
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: bold; line-height: 1.2;">
                        <a href="/jobs/detail/${job.id}" target="_blank" class="hover:underline" style="text-decoration: none; color: #fff;">${job.title}</a>
                    </h3>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #9ca3af; font-family: monospace;">${job.companyName}</p>
                </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 8px;">
                    ${typeBadge}
            </div>
            ${salaryHtml}
            <div style="margin-top: 12px; text-align: right; border-top: 1px solid #374151; padding-top: 8px;">
                    <a href="/jobs/detail/${job.id}" target="_blank" style="
                        font-size: 13px; 
                        color: #00FF41; 
                        text-decoration: none; 
                        font-weight: 600; 
                        font-family: monospace;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        transition: all 0.2s;
                    "
                    onmouseover="this.style.textShadow='0 0 8px rgba(0,255,65,0.5)'"
                    onmouseout="this.style.textShadow='none'"
                    >
                        Vedi Offerta <span style="font-size: 16px;">&rarr;</span>
                    </a>
            </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: contentString,
      });

      marker.addListener("click", () => {
        // Close other open infoWindows if needed, but for now just open
        infoWindow.open({
          anchor: marker,
          map: map.value as GoogleMap,
        });
        if (props.onMarkerClick$) {
          props.onMarkerClick$(job.id);
        }
      });

      // Style the InfoWindow background (requires some DOM manipulation or CSS override globally) for global dark mode map style
      // Note: Google Maps InfoWindow styling is notoriously hard without custom overlays.
      // We will rely on the inner content div for styling.

      newMarkers.push(marker);
    });

    markers.value = newMarkers.map((m) => noSerialize(m));
  });

  const initMap = $(() => {
    if (!mapContainerRef.value || !window.google?.maps) return;

    if (!map.value) {
      const italyCenter = { lat: 41.8719, lng: 12.5674 };
      const newMap = new window.google.maps.Map(mapContainerRef.value, {
        center: italyCenter,
        zoom: 5,
        styles: [
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
        ],
      });
      map.value = noSerialize(newMap);
    }

    updateMarkers();
  });

  useOn(
    "qvisible",
    $(() => {
      const loadMap = () => {
        if (!mapContainerRef.value || typeof window === "undefined") return;

        if (!window.google?.maps) {
          // Script should be loaded by layout or other components, but fallback check
          const scriptId = "google-maps-script";
          if (!document.getElementById(scriptId)) {
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
            // Wait for it
            const i = setInterval(() => {
              if (window.google?.maps) {
                clearInterval(i);
                initMap();
              }
            }, 100);
          }
          return;
        }
        initMap();
      };

      loadMap();
    }),
  );

  useTask$(({ track }) => {
    track(() => props.jobs);
    if (isBrowser && map.value) {
      updateMarkers();
    }
  });

  return (
    <div
      ref={mapContainerRef}
      class="shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl w-full h-[500px]"
    />
  );
});
