import { component$, $, useStore, type QRL } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

import { LocationAutocomplete } from "../ui/location-autocomplete";

interface JobSearchFilters {
  query: string;
  seniority: string;
  availability: string;
  location: string;
  location_geo?: { lat: number; lng: number };
  remote: string;
  dateRange: string;
}

interface JobSearchProps {
  onSearch$: QRL<(filters: JobSearchFilters) => void>;
  initialLocation?: string;
  initialGeo?: { lat: number; lng: number };
  initialQuery?: string;
  initialSeniority?: string;
  initialAvailability?: string;
  initialRemote?: string;
  initialDateRange?: string;
  userHasLanguages?: boolean;
}

export const JobSearch = component$<JobSearchProps>(({
  onSearch$,
  initialLocation,
  initialGeo,
  initialQuery,
  initialSeniority,
  initialAvailability,
  initialRemote,
  initialDateRange,
  userHasLanguages
}) => {
  const t = useTranslate();
  const state = useStore<JobSearchFilters>({
    query: initialQuery || '',
    seniority: initialSeniority || '',
    availability: initialAvailability || '',
    location: initialLocation || '',
    location_geo: initialGeo,
    remote: initialRemote || '',
    dateRange: initialDateRange || ''
  });

  const handleSearch = $(() => {
    onSearch$(state);
  });

  const handleReset = $(() => {
    state.query = '';
    state.seniority = '';
    state.availability = '';
    state.location = '';
    state.location_geo = undefined;
    state.remote = '';
    state.dateRange = '';
    onSearch$(state);
  });

  const hasFilters = state.query || state.seniority || state.availability || state.location || state.remote || state.dateRange;

  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search query */}
        {/* Search query */}
        <div class="lg:col-span-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('jobs.search_label')}
          </label>
          <div class="relative">
            <input
              type="text"
              value={state.query}
              onInput$={(e) => state.query = (e.target as HTMLInputElement).value}
              placeholder={t('jobs.search_placeholder')}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
              onKeyDown$={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Location search */}
        <div class="lg:col-span-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('jobs.location_label')}
          </label>
          <div class="relative">
            <LocationAutocomplete
              value={state.location}
              onInput$={(val) => state.location = val}
              onLocationSelect$={(loc, coords) => {
                state.location = loc;
                state.location_geo = coords;
                handleSearch();
              }}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Date range */}
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('jobs.published_label')}
          </label>
          <select
            value={state.dateRange}
            onChange$={(e) => state.dateRange = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
          >
            <option value="">{t('jobs.all_dates')}</option>
            <option value="today">{t('jobs.today')}</option>
            <option value="week">{t('jobs.week')}</option>
            <option value="month">{t('jobs.month')}</option>
            <option value="3months">{t('jobs.3months')}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Seniority */}
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('jobs.seniority_label')}
          </label>
          <select
            value={state.seniority}
            onChange$={(e) => state.seniority = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
          >
            <option value="">{t('jobs.all_levels')}</option>
            <option value="junior">{t('jobs.junior')}</option>
            <option value="mid">{t('jobs.mid')}</option>
            <option value="senior">{t('jobs.senior')}</option>
          </select>
        </div>

        {/* Availability */}
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('jobs.work_type_label')}
          </label>
          <select
            value={state.availability}
            onChange$={(e) => state.availability = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
          >
            <option value="">{t('jobs.all_types')}</option>
            <option value="full-time">{t('jobs.full_time')}</option>
            <option value="part-time">{t('jobs.part_time')}</option>
            <option value="contract">{t('jobs.contract')}</option>
          </select>
        </div>

        {/* Remote */}
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('jobs.mode_label')}
          </label>
          <select
            value={state.remote}
            onChange$={(e) => state.remote = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
          >
            <option value="">{t('jobs.all_modes')}</option>
            <option value="remote">{t('jobs.remote')}</option>
            <option value="office">{t('jobs.office')}</option>
          </select>
        </div>

        {/* Actions */}
        <div class="flex items-end gap-2">
          <button
            onClick$={handleSearch}
            class="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
          >
            {t('jobs.search_btn')}
          </button>

          {hasFilters && (
            <button
              onClick$={handleReset}
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>



      {/* Active filters display */}
      {hasFilters && (
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">{t('jobs.active_filters')}</span>

            {state.query && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                "{state.query}"
              </span>
            )}

            {state.location && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {state.location}
              </span>
            )}



            {state.seniority && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {state.seniority === 'mid' ? t('jobs.mid') :
                  state.seniority === 'junior' ? t('jobs.junior') :
                    state.seniority === 'senior' ? t('jobs.senior') : state.seniority}
              </span>
            )}

            {state.availability && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {state.availability === 'full-time' ? t('jobs.full_time') :
                  state.availability === 'part-time' ? t('jobs.part_time') :
                    state.availability === 'contract' ? t('jobs.contract') : state.availability}
              </span>
            )}

            {state.remote && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {state.remote === 'remote' ? t('jobs.remote') : t('jobs.office')}
              </span>
            )}

            {state.dateRange && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {state.dateRange === 'today' ? t('jobs.today') :
                  state.dateRange === 'week' ? t('jobs.week') :
                    state.dateRange === 'month' ? t('jobs.month') :
                      state.dateRange === '3months' ? t('jobs.3months') : state.dateRange}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});