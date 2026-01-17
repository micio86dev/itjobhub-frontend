import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./job-map-section.css?inline";
import { useTranslate } from "~/contexts/i18n";

interface JobMapSectionProps {
  location: string;
  geo?: { lat: number; lng: number };
}

export const JobMapSection = component$<JobMapSectionProps>(
  ({ location, geo }) => {
    useStylesScoped$(styles);
    const t = useTranslate();
    const googleMapsKey = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;

    return (
      <div class="mapContainer">
        <div class="mapWrapper">
          <iframe
            title={t("jobs.location_map")}
            width="100%"
            height="100%"
            style="border:0"
            src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${
              geo ? `${geo.lat},${geo.lng}` : encodeURIComponent(location)
            }&zoom=14`}
            allowFullscreen
          ></iframe>
          <div class="mapLabel">{location}</div>
        </div>
      </div>
    );
  },
);
