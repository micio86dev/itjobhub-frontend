import { component$, $, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useJobs } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";
import { JobCard } from "~/components/jobs/job-card";
import { CommentsSection } from "~/components/jobs/comments-section";
import { JobSearch } from "~/components/jobs/job-search";
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll";
import type { JobFilters, JobListing } from "~/contexts/jobs";

interface JobSearchFilters {
  query: string;
  seniority: string;
  availability: string;
  remote: string;
  dateRange: string;
}

export default component$(() => {
  const jobsContext = useJobs();
  const auth = useAuth();
  
  // Extract values to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  
  const state = useStore({
    displayedJobs: [] as JobListing[],
    page: 1,
    pageSize: 6,
    isLoading: false,
    hasNextPage: true,
    openComments: {} as Record<string, boolean>,
    showPersonalized: false,
    searchFilters: null as JobFilters | null,
    hasSearched: false,
    shouldLoadJobs: true
  });

  // Calculate jobs to show based on current state - this runs reactively
  const allJobsToShow = (() => {
    if (state.searchFilters) {
      return jobsContext.getJobs(1, 100, state.searchFilters);
    } else if (state.showPersonalized && isAuthenticated && user?.profileCompleted) {
      return jobsContext.getFilteredJobs(
        user.skills || [],
        user.availability || 'full-time'
      );
    } else {
      return jobsContext.getJobs(1, 100);
    }
  })();

  // Calculate displayed jobs based on pagination
  const displayedJobs = (() => {
    const startIndex = 0; // Always start from beginning for simplicity
    const endIndex = state.page * state.pageSize;
    return allJobsToShow.slice(startIndex, endIndex);
  })();

  // Update displayed jobs when calculation changes
  state.displayedJobs = displayedJobs;
  state.hasNextPage = (state.page * state.pageSize) < allJobsToShow.length;

  const loadMore = $(() => {
    if (!state.isLoading && state.hasNextPage) {
      state.page++;
    }
  });

  const togglePersonalized = $(() => {
    state.showPersonalized = !state.showPersonalized;
    state.page = 1;
  });

  const toggleComments = $((jobId: string) => {
    state.openComments[jobId] = !state.openComments[jobId];
  });

  const handleSearch = $((filters: JobSearchFilters) => {
    const hasFilters = filters.query || filters.seniority || filters.availability || 
                      filters.remote || filters.dateRange;
    
    // Convert JobSearchFilters to JobFilters
    const convertedFilters: JobFilters | null = hasFilters ? {
      query: filters.query,
      seniority: filters.seniority,
      availability: filters.availability,
      remote: filters.remote === 'remote' ? true : 
              filters.remote === 'office' ? false : undefined,
      dateRange: filters.dateRange
    } : null;
    
    state.searchFilters = convertedFilters;
    state.hasSearched = hasFilters;
    state.showPersonalized = false; // Disable personalized when searching
    state.page = 1;
  });

  // Infinite scroll setup
  const { ref: infiniteScrollRef } = useInfiniteScroll({
    hasNextPage: state.hasNextPage,
    isLoading: state.isLoading,
    loadMore$: loadMore,
  });

  // Jobs are loaded automatically through reactive calculations

  const canShowPersonalized = isAuthenticated && user?.profileCompleted && !state.hasSearched;

  return (
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Annunci di Lavoro
        </h1>

        {/* Search component */}
        <JobSearch onSearch$={handleSearch} />
        
        {/* Filter toggle for authenticated users */}
        {canShowPersonalized && (
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <button
                onClick$={togglePersonalized}
                class={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.showPersonalized
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {state.showPersonalized ? '🎯 Feed Personalizzato' : '📋 Tutti gli Annunci'}
              </button>
              
              {state.showPersonalized && (
                <span class="text-sm text-gray-600">
                  Basato sulle tue skills: {user?.skills?.join(', ')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Info for non-authenticated users */}
        {!isAuthenticated && (
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <a href="/register" class="font-medium hover:text-blue-600">
                    Registrati
                  </a>
                  {' '}e completa il tuo profilo per vedere annunci personalizzati basati sulle tue competenze!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info for authenticated users without completed profile */}
        {isAuthenticated && !user?.profileCompleted && (
          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  <a href="/wizard" class="font-medium hover:text-yellow-600">
                    Completa il tuo profilo
                  </a>
                  {' '}per ricevere annunci personalizzati basati sulle tue competenze!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jobs list */}
      <div class="space-y-6">
        {state.displayedJobs.length === 0 && !state.isLoading ? (
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Nessun annuncio trovato
            </h3>
            <p class="text-gray-500">
              {state.showPersonalized 
                ? 'Prova a modificare i filtri o torna alla vista generale'
                : 'Non ci sono annunci disponibili al momento'
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
                  <CommentsSection jobId={job.id} />
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
            <span class="text-gray-600">Caricamento annunci...</span>
          </div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {state.hasNextPage && !state.isLoading && (
        <div ref={infiniteScrollRef} class="h-20 flex items-center justify-center">
          <div class="text-gray-400">
            <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span class="text-sm">Scorri per caricare altri annunci</span>
          </div>
        </div>
      )}

      {/* End of results */}
      {!state.hasNextPage && state.displayedJobs.length > 0 && (
        <div class="text-center py-8">
          <div class="text-gray-400 mb-2">
            <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-gray-500 text-sm">
            Hai visualizzato tutti gli annunci disponibili
          </p>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Annunci di Lavoro - ITJobHub",
  meta: [
    {
      name: "description",
      content: "Scopri le migliori opportunità di lavoro nel settore IT. Annunci personalizzati, like, commenti e molto altro.",
    },
  ],
};