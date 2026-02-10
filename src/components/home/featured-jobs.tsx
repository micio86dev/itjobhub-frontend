import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";
import { JobCard } from "~/components/jobs/job-card";
import type { JobListing } from "~/contexts/jobs";
import styles from "./featured-jobs.css?inline";

interface FeaturedJobsProps {
  jobs: JobListing[];
  matchScores: Record<
    string,
    { score: number; label: "excellent" | "good" | "fair" | "low" }
  >;
  isLoading: boolean;
}

export const FeaturedJobs = component$<FeaturedJobsProps>(
  ({ jobs, matchScores, isLoading }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    return (
      <section class="featured-jobs">
        <div class="container">
          <div class="header">
            <div>
              <h2 class="title">{t("home.recent_jobs_title")}</h2>
              <p class="subtitle">{t("home.recent_jobs_subtitle")}</p>
            </div>
            <a href="/jobs" class="view-all-link">
              {t("home.view_all_jobs")}
              <svg
                class="link-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>

          <div class="jobs-grid">
            {!isLoading && jobs.length > 0
              ? jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    matchScore={matchScores[job.id]}
                  />
                ))
              : // Skeletons
                [1, 2, 3].map((i) => <div key={i} class="skeleton"></div>)}
          </div>

          <div class="mobile-cta">
            <a href="/jobs" class="mobile-button">
              {t("home.view_all_jobs")}
            </a>
          </div>
        </div>
      </section>
    );
  },
);
