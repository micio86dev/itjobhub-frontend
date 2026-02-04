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
  salaryMin: string;
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
  initialSalaryMin?: string;
  userHasLanguages?: boolean;
}

export const JobSearch = component$<JobSearchProps>(
  ({
    onSearch$,
    initialLocation,
    initialGeo,
    initialQuery,
    initialSeniority,
    initialAvailability,
    initialRemote,
    initialDateRange,
    initialSalaryMin,
    // userHasLanguages is currently unused but kept in props for future use
  }) => {
    const t = useTranslate();
    const state = useStore<JobSearchFilters>({
      query: initialQuery || "",
      seniority: initialSeniority || "",
      availability: initialAvailability || "",
      location: initialLocation || "",
      location_geo: initialGeo,
      remote: initialRemote || "",
      dateRange: initialDateRange || "",
      salaryMin: initialSalaryMin || "",
    });

    const handleSearch = $(() => {
      onSearch$(state);
    });

    const handleReset = $(() => {
      state.query = "";
      state.seniority = "";
      state.availability = "";
      state.location = "";
      state.location_geo = undefined;
      state.remote = "";
      state.dateRange = "";
      state.salaryMin = "";
      onSearch$(state);
    });

    const hasFilters =
      state.query ||
      state.seniority ||
      state.availability ||
      state.location ||
      state.remote ||
      state.dateRange ||
      state.salaryMin;

    return (
      <div class="bg-brand-light-card dark:bg-brand-dark-card shadow-none mb-6 p-4 sm:p-6 border border-gray-200 dark:border-gray-800 rounded-sm">
        <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Search query */}
          <div class="lg:col-span-1">
            <label class="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t("jobs.search_label")}
            </label>
            <div class="relative">
              <input
                type="text"
                value={state.query}
                onInput$={(e) =>
                  (state.query = (e.target as HTMLInputElement).value)
                }
                data-testid="search-query"
                placeholder={t("jobs.search_placeholder")}
                class="pl-10 input"
                onKeyDown$={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <div class="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Location search */}
          <div class="lg:col-span-1">
            <label class="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t("jobs.location_label")}
            </label>
            <div class="relative">
              <LocationAutocomplete
                value={state.location}
                onInput$={(val) => {
                  state.location = val;
                  // Clear geo coordinates when user types manually to avoid mismatch
                  // until they select a suggestion
                  state.location_geo = undefined;
                }}
                onLocationSelect$={(loc, coords) => {
                  state.location = loc;
                  state.location_geo = coords;
                  handleSearch();
                }}
                class="pl-10 input"
              />
              <div class="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Date range */}
          <div>
            <label class="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t("jobs.published_label")}
            </label>
            <select
              value={state.dateRange}
              onChange$={(e) =>
                (state.dateRange = (e.target as HTMLSelectElement).value)
              }
              class="select"
              aria-label={t("jobs.published_label")}
            >
              <option value="">{t("jobs.all_dates")}</option>
              <option value="today">{t("jobs.today")}</option>
              <option value="week">{t("jobs.week")}</option>
              <option value="month">{t("jobs.month")}</option>
              <option value="3months">{t("jobs.3months")}</option>
            </select>
          </div>
        </div>

        <div class="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          {/* Seniority */}
          <div>
            <label class="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t("jobs.seniority_label")}
            </label>
            <select
              value={state.seniority}
              onChange$={(e) =>
                (state.seniority = (e.target as HTMLSelectElement).value)
              }
              data-testid="search-seniority"
              class="select"
              aria-label={t("jobs.seniority_label")}
            >
              <option value="">{t("jobs.all_levels")}</option>
              <option value="junior">{t("jobs.junior")}</option>
              <option value="mid">{t("jobs.mid")}</option>
              <option value="senior">{t("jobs.senior")}</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label class="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t("jobs.work_type_label")}
            </label>
            <select
              value={state.availability}
              onChange$={(e) =>
                (state.availability = (e.target as HTMLSelectElement).value)
              }
              data-testid="search-availability"
              class="select"
              aria-label={t("jobs.work_type_label")}
            >
              <option value="">{t("jobs.all_types")}</option>
              <option value="full-time">{t("jobs.full_time")}</option>
              <option value="part-time">{t("jobs.part_time")}</option>
              <option value="contract">{t("jobs.contract")}</option>
              <option value="freelance">{t("jobs.freelance")}</option>
              <option value="internship">{t("jobs.internship")}</option>
            </select>
          </div>

          {/* Remote */}
          <div>
            <label class="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t("jobs.mode_label")}
            </label>
            <select
              value={state.remote}
              onChange$={(e) =>
                (state.remote = (e.target as HTMLSelectElement).value)
              }
              data-testid="search-remote"
              class="select"
              aria-label={t("jobs.mode_label")}
            >
              <option value="">{t("jobs.all_modes")}</option>
              <option value="remote">{t("jobs.remote")}</option>
              <option value="hybrid">{t("jobs.hybrid")}</option>
              <option value="office">{t("jobs.office")}</option>
            </select>
          </div>

          {/* Minimum RAL Slider */}
          <div>
            <label class="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t("jobs.salary_label")}
              {state.salaryMin && (
                <span class="ml-2 font-mono text-brand-neon">
                  €{Number(state.salaryMin).toLocaleString("it-IT")}+
                </span>
              )}
            </label>
            <div class="relative">
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={state.salaryMin || "0"}
                onInput$={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  state.salaryMin = val === "0" ? "" : val;
                }}
                data-testid="search-salary-min"
                class="bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-2 accent-brand-neon appearance-none cursor-pointer"
                aria-label={t("jobs.salary_label")}
              />
              <div class="flex justify-between mt-1 font-mono text-gray-500 dark:text-gray-400 text-xs">
                <span>{t("jobs.salary_any")}</span>
                <span>20k</span>
                <span>40k</span>
                <span>60k</span>
                <span>80k</span>
                <span>100k+</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div class="flex items-end gap-2">
            <button
              onClick$={handleSearch}
              data-testid="search-submit"
              class="flex-1 btn-primary"
            >
              {t("jobs.search_btn")}
            </button>

            {hasFilters && (
              <button onClick$={handleReset} class="px-3 btn-secondary">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        {hasFilters && (
          <div class="mt-4 pt-4 border-gray-200 dark:border-gray-700 border-t">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-gray-500 dark:text-gray-400 text-sm">
                {t("jobs.active_filters")}
              </span>

              {state.query && (
                <span class="inline-flex items-center bg-brand-neon/10 px-2.5 py-0.5 border border-brand-neon/20 rounded-full font-mono font-bold text-brand-neon text-xs">
                  "{state.query}"
                </span>
              )}

              {state.location && (
                <span class="inline-flex items-center bg-brand-neon/10 px-2.5 py-0.5 border border-brand-neon/20 rounded-full font-mono font-bold text-brand-neon text-xs">
                  {state.location}
                </span>
              )}

              {state.seniority && (
                <span class="inline-flex items-center bg-brand-neon/10 px-2.5 py-0.5 border border-brand-neon/20 rounded-full font-mono font-bold text-brand-neon text-xs">
                  {state.seniority === "mid"
                    ? t("jobs.mid")
                    : state.seniority === "junior"
                      ? t("jobs.junior")
                      : state.seniority === "senior"
                        ? t("jobs.senior")
                        : state.seniority}
                </span>
              )}

              {state.availability && (
                <span class="inline-flex items-center bg-brand-neon/10 px-2.5 py-0.5 border border-brand-neon/20 rounded-full font-mono font-bold text-brand-neon text-xs">
                  {state.availability === "full-time"
                    ? t("jobs.full_time")
                    : state.availability === "part-time"
                      ? t("jobs.part_time")
                      : state.availability === "hybrid"
                        ? t("jobs.hybrid")
                        : state.availability === "contract"
                          ? t("jobs.contract")
                          : state.availability === "freelance"
                            ? t("jobs.freelance")
                            : state.availability === "internship"
                              ? t("jobs.internship")
                              : state.availability}
                </span>
              )}

              {state.remote && (
                <span class="inline-flex items-center bg-brand-neon/10 px-2.5 py-0.5 border border-brand-neon/20 rounded-full font-mono font-bold text-brand-neon text-xs">
                  {state.remote === "remote"
                    ? t("jobs.remote")
                    : state.remote === "hybrid"
                      ? t("jobs.hybrid")
                      : t("jobs.office")}
                </span>
              )}

              {state.dateRange && (
                <span class="inline-flex items-center bg-brand-neon/10 px-2.5 py-0.5 border border-brand-neon/20 rounded-full font-mono font-bold text-brand-neon text-xs">
                  {state.dateRange === "today"
                    ? t("jobs.today")
                    : state.dateRange === "week"
                      ? t("jobs.week")
                      : state.dateRange === "month"
                        ? t("jobs.month")
                        : state.dateRange === "3months"
                          ? t("jobs.3months")
                          : state.dateRange}
                </span>
              )}

              {state.salaryMin && (
                <span class="inline-flex items-center bg-brand-neon/10 px-2.5 py-0.5 border border-brand-neon/20 rounded-full font-mono font-bold text-brand-neon text-xs">
                  €{Number(state.salaryMin).toLocaleString("it-IT")}+
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);
