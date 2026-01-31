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
    <div class="mx-auto sm:px-6 lg:px-8 py-6 container">
      <div class="px-4 sm:px-0 py-6">
        <h1 class="mb-6 font-bold text-gray-900 dark:text-gray-100 text-3xl">
          {t("nav.favorites")}
        </h1>

        {!auth.isAuthenticated ? (
          <div class="py-12 text-center">
            <p class="text-gray-600 dark:text-gray-300 text-lg">
              {t("auth.login_required")}
            </p>
            <a
              href="/login"
              class="inline-flex justify-center items-center bg-brand-neon hover:bg-brand-neon-hover mt-4 px-4 py-2 border border-transparent rounded-sm font-mono font-bold text-white dark:text-black text-base uppercase tracking-wide"
            >
              {t("home.login")}
            </a>
          </div>
        ) : state.isLoading ? (
          <div class="flex justify-center items-center py-12">
            <div class="border-brand-neon border-b-2 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : jobsState.favorites.length === 0 ? (
          <div class="py-12 text-center">
            <p class="mb-4 text-gray-600 dark:text-gray-300 text-lg">
              {t("jobs.no_favorites")}
            </p>
            <a
              href="/jobs"
              class="font-medium text-brand-neon hover:text-brand-neon-hover"
            >
              {t("home.find_opportunities")}
            </a>
          </div>
        ) : (
          <div class="gap-6 grid jobs-grid md:grid-cols-2 lg:grid-cols-3">
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
    title: t("nav.favorites") + " - DevBoards.io",
    meta: [
      {
        name: "description",
        content: "Your favorite tech jobs",
      },
    ],
  };
};
