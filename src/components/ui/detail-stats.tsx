import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./detail-stats.css?inline";

interface DetailStatsProps {
  viewsCount: number;
  clicksCount: number;
  viewsLabel: string;
  clicksLabel: string;
  viewsTitle?: string;
  clicksTitle?: string;
}

export const DetailStats = component$<DetailStatsProps>((props) => {
  useStylesScoped$(styles);

  return (
    <div class="trackingStats">
      <span class="statItem" title={props.viewsTitle}>
        <svg
          class="statIcon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        {props.viewsCount} {props.viewsLabel}
      </span>
      <span class="statItem" title={props.clicksTitle}>
        <svg
          class="statIcon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
        {props.clicksCount} {props.clicksLabel}
      </span>
    </div>
  );
});
