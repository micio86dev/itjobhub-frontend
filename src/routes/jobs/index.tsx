import { component$, $, useStore, useTask$ } from "@builder.io/qwik";
import { type DocumentHead, useLocation, routeLoader$ } from "@builder.io/qwik-city";
import { useJobs } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";
import { useTranslate, type SupportedLanguage } from "~/contexts/i18n";
import { JobCard } from "~/components/jobs/job-card";
import { CommentsSection } from "~/components/jobs/comments-section";
import { JobSearch } from "~/components/jobs/job-search";
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll";
import { ScrollButtons } from "~/components/ui/scroll-buttons";
import type { JobFilters, JobListing } from "~/contexts/jobs";

// Import translations for server-side DocumentHead
import it from "~/locales/it.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import de from "~/locales/de.json";
import fr from "~/locales/fr.json";

const translations = { it, en, es, de, fr };

export const useHeadMeta = routeLoader$(({ cookie }) => {
  const savedLang = cookie.get('preferred-language')?.value as SupportedLanguage || 'it';
  const lang = savedLang in translations ? savedLang : 'it';
  const t = translations[lang];
  return {
    title: t['meta.jobs_title'] || 'Annunci di Lavoro - ITJobHub',
    description: t['meta.jobs_description'] || 'Scopri le migliori opportunità di lavoro nel settore IT.'
  };
});

interface JobSearchFilters {
  query: string;
  seniority: string;
  availability: string;
  location: string;
  location_geo?: { lat: number; lng: number };
  remote: string;
  dateRange: string;
}

export default component$(() => {
  const auth = useAuth();
  const t = useTranslate();
  const location = useLocation();

  // Parse initial filters from URL
  const urlParams = location.url.searchParams;
  const initialQuery = urlParams.get('q') || '';
  const initialRemote = urlParams.get('remote') || '';
  // We could add others here if needed

  const hasInitialSearch = !!(initialQuery || initialRemote);

  const state = useStore({
    displayedJobs: [] as JobListing[],
    page: 1,
    pageSize: 6,
    isLoading: false,
    hasNextPage: true,
    openComments: {} as Record<string, boolean>,
    showPersonalized: auth.isAuthenticated && auth.user?.profileCompleted && !hasInitialSearch,
    searchFilters: hasInitialSearch ? {
      query: initialQuery,
      remote: initialRemote === 'true' ? true : initialRemote === 'false' ? false : undefined,
    } as JobFilters : null,
    hasSearched: hasInitialSearch,
    shouldLoadJobs: true,
    totalJobsCount: 0
  });

  const jobsState = useJobs();

  // Update displayed jobs from server-side paginated context
  // Update displayed jobs from server-side paginated context
  useTask$(({ track }) => {
    track(() => jobsState.jobs);
    track(() => jobsState.pagination.hasMore);
    track(() => jobsState.pagination.totalJobs);
    track(() => jobsState.pagination.isLoading);

    state.displayedJobs = [...jobsState.jobs];
    state.totalJobsCount = jobsState.pagination.totalJobs;
    state.hasNextPage = jobsState.pagination.hasMore;
    state.isLoading = jobsState.pagination.isLoading;
  });

  // Initial fetch logic
  useTask$(async ({ track }) => {
    track(() => auth.isAuthenticated);
    track(() => auth.user);

    // Update personalization state based on auth availability
    // This ensures that when auth is restored on client, we switch to personalized view
    if (auth.isAuthenticated && auth.user?.profileCompleted && !hasInitialSearch) {
      state.showPersonalized = true;
    }

    // Gather user language filters first
    const userLanguages = auth.user?.languages ? Array.from(auth.user.languages) : undefined;

    if (hasInitialSearch) {
      // Logic for when coming from Home search or having URL params
      const remoteVal = initialRemote === 'true' ? true : initialRemote === 'false' ? false : undefined;

      const filters: JobFilters = {
        query: initialQuery,
        remote: remoteVal,
        languages: userLanguages,
      };
      await jobsState.fetchJobsPage$(1, filters, false);
    } else if (jobsState.jobs.length === 0) {
      // Logic for default load (direct navigation to /jobs)
      let filters: JobFilters | undefined = userLanguages ? { languages: userLanguages } : undefined;

      if (state.showPersonalized && auth.user) {
        filters = {
          ...filters,
          skills: auth.user.skills ? Array.from(auth.user.skills) : undefined,
          seniority: auth.user.seniority,
          availability: auth.user.availability,
          looseSeniority: true,
        };
      }

      state.searchFilters = filters || null;
      await jobsState.fetchJobsPage$(1, filters, false);
    }
  });

  const loadMore = $(async () => {
    if (!state.isLoading && state.hasNextPage) {
      await jobsState.loadMoreJobs$();
    }
  });

  const togglePersonalized = $(async () => {
    state.showPersonalized = !state.showPersonalized;
    state.page = 1;

    if (state.showPersonalized && auth.user) {
      // Build filters from user profile
      const personalFilters: JobFilters = {
        skills: auth.user.skills ? Array.from(auth.user.skills) : undefined,
        seniority: auth.user.seniority,
        availability: auth.user.availability,
        languages: auth.user.languages ? Array.from(auth.user.languages) : undefined,
        looseSeniority: true,
        // We might want to include location/remote preferences from profile too if available, 
        // but sticking to skills/seniority for "Feed" to match previous logic
      };
      state.searchFilters = personalFilters; // Keep track of current filters
      await jobsState.fetchJobsPage$(1, personalFilters, false);
    } else {
      // Reset to all jobs but keep language filter if applicable
      const baseFilters: JobFilters | undefined = auth.user?.languages && auth.user.languages.length > 0
        ? { languages: Array.from(auth.user.languages) }
        : undefined;

      state.searchFilters = baseFilters || null;
      await jobsState.fetchJobsPage$(1, baseFilters, false);
    }
  });

  const toggleComments = $((jobId: string) => {
    state.openComments[jobId] = !state.openComments[jobId];
    if (state.openComments[jobId]) {
      jobsState.fetchComments$(jobId);
    }
  });

  const handleSearch = $(async (filters: JobSearchFilters) => {
    const hasFilters = !!(filters.query || filters.seniority || filters.availability ||
      filters.location || filters.remote || filters.dateRange);

    // Forces language filtering if user has spoken languages
    // forces language filtering if user has spoken languages
    const userLanguages = (auth.isAuthenticated && auth.user?.languages) ? Array.from(auth.user.languages) : undefined;
    const shouldFilterByLanguage = userLanguages && userLanguages.length > 0;

    // Convert JobSearchFilters to JobFilters for API
    const convertedFilters: JobFilters | null = (hasFilters || shouldFilterByLanguage) ? {
      query: filters.query,
      seniority: filters.seniority,
      availability: filters.availability,
      location: filters.location,
      location_geo: filters.location_geo,
      radius_km: 50, // Default 50km radius
      remote: filters.remote === 'remote' ? true :
        filters.remote === 'office' ? false : undefined,
      dateRange: filters.dateRange,
      // Always apply strict language filtering if user has languages
      languages: userLanguages
    } : null;

    state.searchFilters = convertedFilters;
    state.hasSearched = hasFilters;
    state.showPersonalized = false; // Disable personalized toggle visual if explicit search gets done

    // Fetch from server with filters
    await jobsState.fetchJobsPage$(1, convertedFilters || undefined, false);
  });

  // Infinite scroll setup
  const { ref: infiniteScrollRef } = useInfiniteScroll({
    loadMore$: loadMore,
  });

  // Jobs are loaded automatically through reactive calculations

  const canShowPersonalized = auth.isAuthenticated && auth.user?.profileCompleted && !state.hasSearched;
  const userHasLanguages = !!(auth.isAuthenticated && auth.user?.languages && auth.user.languages.length > 0);

  return (
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('jobs.title')}
        </h1>

        {/* Search component */}
        <JobSearch
          onSearch$={handleSearch}
          initialLocation={auth.user?.location || undefined}
          initialGeo={auth.user?.location_geo?.coordinates && auth.user.location_geo.coordinates.length >= 2 ? {
            lat: auth.user.location_geo.coordinates[1],
            lng: auth.user.location_geo.coordinates[0]
          } : undefined}
          initialQuery={initialQuery}
          initialRemote={initialRemote === 'true' ? 'remote' : initialRemote === 'false' ? 'office' : ''}
          userHasLanguages={userHasLanguages}
        />

        {/* Filter toggle for authenticated users */}
        {canShowPersonalized && (
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <button
                onClick$={togglePersonalized}
                class={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${state.showPersonalized
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                {state.showPersonalized ? t('jobs.personalized_feed') : t('jobs.all_jobs')}
              </button>

              {state.showPersonalized && (
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {t('jobs.skills_based_on')} {auth.user?.skills?.join(', ')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Info for non-authenticated users */}
        {!auth.isAuthenticated && (
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  <a href="/register" class="font-medium hover:text-blue-600 dark:hover:text-blue-200">
                    {t('common.register')}
                  </a>
                  {' '}{t('jobs.register_msg')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info for authenticated users without completed profile */}
        {auth.isAuthenticated && !auth.user?.profileCompleted && (
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700 dark:text-yellow-300">
                  <a href="/wizard" class="font-medium hover:text-yellow-600 dark:hover:text-yellow-200">
                    {t('profile.complete_profile')}
                  </a>
                  {' '}{t('jobs.complete_profile_msg')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {state.totalJobsCount > 0 && (
        <div class="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          {state.hasNextPage
            ? t('jobs.showing_count').replace('{count}', state.totalJobsCount.toString())
            : t('jobs.found_count').replace('{count}', state.totalJobsCount.toString())
          }
        </div>
      )}

      {/* Jobs list */}
      <div class="space-y-6">
        {state.displayedJobs.length === 0 && !state.isLoading ? (
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('jobs.no_jobs')}
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              {state.showPersonalized
                ? t('jobs.no_jobs_personalized')
                : t('jobs.no_jobs_general')
              }
            </p>
          </div>
        ) : (
          state.displayedJobs.map((job) => (
            <div key={job.id}>
              <JobCard
                job={job}
                onToggleComments$={toggleComments}
                showComments={!!state.openComments[job.id]}
              />

              {state.openComments[job.id] && (
                <div class="ml-4 sm:ml-6 mr-4 sm:mr-6">
                  <CommentsSection
                    jobId={job.id}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Loading spinner */}
      {state.isLoading && (
        <div class="flex justify-center py-8">
          <div class="flex items-center space-x-2">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span class="text-gray-600 dark:text-gray-400">{t('jobs.loading')}</span>
          </div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {state.hasNextPage && !state.isLoading && (
        <div ref={infiniteScrollRef} class="h-20 flex items-center justify-center">
          <div class="text-gray-400 dark:text-gray-500">
            <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span class="text-sm">{t('jobs.scroll_more')}</span>
          </div>
        </div>
      )}

      {/* End of results */}
      {!state.hasNextPage && state.displayedJobs.length > 0 && (
        <div class="text-center py-8">
          <div class="text-gray-400 dark:text-gray-500 mb-2">
            <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            {t('jobs.end_results')}
          </p>
        </div>
      )}

      {/* Quick scroll buttons */}
      <ScrollButtons />
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const meta = resolveValue(useHeadMeta);
  return {
    title: meta.title,
    meta: [
      {
        name: "description",
        content: meta.description,
      },
    ],
  };
};