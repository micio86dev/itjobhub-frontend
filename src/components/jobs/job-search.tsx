import { component$, $, useStore, type QRL } from "@builder.io/qwik";

interface JobSearchFilters {
  query: string;
  seniority: string;
  availability: string;
  remote: string;
  dateRange: string;
}

interface JobSearchProps {
  onSearch$: QRL<(filters: JobSearchFilters) => void>;
}

export const JobSearch = component$<JobSearchProps>(({ onSearch$ }) => {
  const state = useStore<JobSearchFilters>({
    query: '',
    seniority: '',
    availability: '',
    remote: '',
    dateRange: ''
  });

  const handleSearch = $(() => {
    onSearch$(state);
  });

  const handleReset = $(() => {
    state.query = '';
    state.seniority = '';
    state.availability = '';
    state.remote = '';
    state.dateRange = '';
    onSearch$(state);
  });

  const hasFilters = state.query || state.seniority || state.availability || state.remote || state.dateRange;

  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search query */}
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cerca annunci
          </label>
          <div class="relative">
            <input
              type="text"
              value={state.query}
            onInput$={(e) => state.query = (e.target as HTMLInputElement).value}
              placeholder="Cerca per titolo, azienda, skills..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown$={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Date range */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Pubblicato
          </label>
          <select
            value={state.dateRange}
            onChange$={(e) => state.dateRange = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tutte le date</option>
            <option value="today">Oggi</option>
            <option value="week">Ultima settimana</option>
            <option value="month">Ultimo mese</option>
            <option value="3months">Ultimi 3 mesi</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Seniority */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Seniority
          </label>
          <select
            value={state.seniority}
            onChange$={(e) => state.seniority = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tutti i livelli</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
        </div>

        {/* Availability */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo di lavoro
          </label>
          <select
            value={state.availability}
            onChange$={(e) => state.availability = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tutti i tipi</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        {/* Remote */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Modalità
          </label>
          <select
            value={state.remote}
            onChange$={(e) => state.remote = (e.target as HTMLSelectElement).value}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tutte le modalità</option>
            <option value="remote">Remote</option>
            <option value="office">In sede</option>
          </select>
        </div>

        {/* Actions */}
        <div class="flex items-end gap-2">
          <button
            onClick$={handleSearch}
            class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cerca
          </button>
          
          {hasFilters && (
            <button
              onClick$={handleReset}
              class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-gray-500">Filtri attivi:</span>
            
            {state.query && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                "{state.query}"
              </span>
            )}
            
            {state.seniority && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {state.seniority === 'mid' ? 'Mid-level' : state.seniority}
              </span>
            )}
            
            {state.availability && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {state.availability === 'full-time' ? 'Full-time' : 
                 state.availability === 'part-time' ? 'Part-time' : 'Contract'}
              </span>
            )}
            
            {state.remote && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {state.remote === 'remote' ? 'Remote' : 'In sede'}
              </span>
            )}
            
            {state.dateRange && (
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {state.dateRange === 'today' ? 'Oggi' :
                 state.dateRange === 'week' ? 'Ultima settimana' :
                 state.dateRange === 'month' ? 'Ultimo mese' :
                 state.dateRange === '3months' ? 'Ultimi 3 mesi' : state.dateRange}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});