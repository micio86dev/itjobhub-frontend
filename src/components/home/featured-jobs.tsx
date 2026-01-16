import { component$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";
import { JobCard } from "~/components/jobs/job-card";
import type { JobListing } from "~/contexts/jobs";

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
    const t = useTranslate();

    return (
      <section class="py-16 bg-white dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-end mb-10">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t("home.recent_jobs_title")}
              </h2>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                {t("home.recent_jobs_subtitle")}
              </p>
            </div>
            <a
              href="/jobs"
              class="hidden sm:flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              {t("home.view_all_jobs")}
              <svg
                class="w-5 h-5 ml-1"
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

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!isLoading && jobs.length > 0
              ? jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    matchScore={matchScores[job.id]}
                  />
                ))
              : // Skeletons
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    class="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse"
                  ></div>
                ))}
          </div>

          <div class="mt-10 text-center sm:hidden">
            <a
              href="/jobs"
              class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            >
              {t("home.view_all_jobs")}
            </a>
          </div>
        </div>
      </section>
    );
  },
);
