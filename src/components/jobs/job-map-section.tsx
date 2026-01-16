import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./job-map-section.css?inline";

interface JobMapSectionProps {
  location: string;
  coordinates: [number, number]; // [lng, lat]
}

export const JobMapSection = component$<JobMapSectionProps>(
  ({ location, coordinates }) => {
    useStylesScoped$(styles);
    const googleMapsKey = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;

    return (
      <div class="mapContainer">
        <div class="mapWrapper">
          <iframe
            width="100%"
            height="100%"
            style="border:0"
            src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${coordinates[1]},${coordinates[0]}&zoom=14`}
            allowFullscreen
          ></iframe>
          <div class="mapLabel">{location}</div>
        </div>
      </div>
    );
  },
);
