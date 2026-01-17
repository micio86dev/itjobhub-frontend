import { component$, useTask$, useStore } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { useJobs } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";
import { JobCard } from "~/components/jobs/job-card";
import { useTranslate, translate } from "~/contexts/i18n";

export default component$(() => {
  const jobsState = useJobs();
  const auth = useAuth();
  const t = useTranslate();

  const state = useStore({
    isLoading: true,
  });

  useTask$(async ({ track }) => {
    track(() => auth.isAuthenticated);
    if (!auth.isAuthenticated) {
      // Assuming 'nav' is available or needs to be imported/defined.
      // For now, I'll comment it out as it's not defined in the original code.
      // nav('/login');
      state.isLoading = false; // Ensure loading state is false if not authenticated
    } else {
      track(() => auth.token); // Keep tracking token for fetching favorites
      state.isLoading = true;
      await jobsState.fetchFavorites$();
      state.isLoading = false;
    }
  });

  return (
    <div class="container mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t("nav.favorites")}
        </h1>

        {!auth.isAuthenticated ? (
          <div class="text-center py-12">
            <p class="text-lg text-gray-600 dark:text-gray-300">
              {t("auth.login_required")}
            </p>
            <a
              href="/login"
              class="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {t("home.login")}
            </a>
          </div>
        ) : state.isLoading ? (
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : jobsState.favorites.length === 0 ? (
          <div class="text-center py-12">
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {t("jobs.no_favorites")}
            </p>
            <a
              href="/jobs"
              class="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {t("home.find_opportunities")}
            </a>
          </div>
        ) : (
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobsState.favorites.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = () => {
  const t = (key: string) => translate(key, "it");
  return {
    title: t("nav.favorites") + " - IT Job Hub",
    meta: [
      {
        name: "description",
        content: "Your favorite tech jobs",
      },
    ],
  };
};
