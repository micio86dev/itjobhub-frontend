import { component$, useStore, useVisibleTask$, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate, translate, useI18n } from "~/contexts/i18n";
import { request } from "../../../utils/api";
import { LineChart } from "~/components/admin/charts/line-chart";

interface Stats {
  overview: {
    users: { total: number; new: number };
    jobs: { total: number; new: number };
    companies: { total: number; new: number };
    engagement: { comments: number; likes: number };
  };
  charts: {
    seniority: { label: string; value: number }[];
    employmentType: { label: string; value: number }[];
    trends: { label: string; value: number }[];
  };
}

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const lang = i18n.currentLanguage;
  const t = useTranslate();

  const state = useStore({
    stats: null as Stats | null,
    isLoading: true,
    error: "",
    selectedMonth: 0, // 0 means Total
    selectedYear: 0,  // 0 means Total
  });

  const fetchStats = $(async () => {
    try {
      state.isLoading = true;
      const url = new URL(`${import.meta.env.PUBLIC_API_URL}/admin/stats`);
      if (state.selectedMonth > 0 && state.selectedYear > 0) {
        url.searchParams.append('month', state.selectedMonth.toString());
        url.searchParams.append('year', state.selectedYear.toString());
      }

      const response = await request(url.toString(), {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      if (!response.ok) {
        throw new Error(translate('admin.fetch_error', i18n.currentLanguage));
      }

      const data = await response.json();
      if (data.success) {
        state.stats = data.data;
      } else {
        state.error = data.message;
      }
    } catch (err: any) {
      state.error = err.message;
    } finally {
      state.isLoading = false;
    }
  });

  // React to month/year changes
  useTask$(({ track }) => {
    track(() => state.selectedMonth);
    track(() => state.selectedYear);
    track(() => auth.token);

    if (auth.isAuthenticated && auth.user?.role === 'admin' && auth.token) {
      fetchStats();
    }
  });

  // Check authentication and role on the client
  useVisibleTask$(({ track }) => {
    const isAuthenticated = track(() => auth.isAuthenticated);
    const user = track(() => auth.user);

    if (isAuthenticated && user) {
      if (user.role !== 'admin') {
        window.location.href = '/';
        return;
      }
    } else {
      // If not authenticated, check if we're still waiting for hydration
      const storageToken = localStorage.getItem('auth_token');
      if (!storageToken) {
        window.location.href = '/login';
      }
    }
  });

  if (state.isLoading) {
    return (
      <div class="flex justify-center items-center min-h-[60vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div class="max-w-7xl mx-auto py-12 px-4">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 class="text-red-800 dark:text-red-300 text-lg font-bold mb-2">Error</h2>
          <p class="text-red-700 dark:text-red-400">{state.error}</p>
        </div>
      </div>
    );
  }

  const stats = state.stats!;

  return (
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">{t('admin.stats_subtitle')}</p>
        </div>

        <div class="flex items-center gap-3">
          <select
            value={state.selectedMonth}
            onChange$={(e) => state.selectedMonth = parseInt((e.target as HTMLSelectElement).value)}
            class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="0">{lang === 'it' ? 'Totale' : 'Total'}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString(lang === 'it' ? 'it-IT' : 'en-US', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={state.selectedYear}
            onChange$={(e) => state.selectedYear = parseInt((e.target as HTMLSelectElement).value)}
            class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="0">{lang === 'it' ? 'Sempre' : 'All-time'}</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y.toString()}>{y.toString()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Card */}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <span class="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
              {t('admin.new_growth').replace('{count}', stats.overview.users.new.toString())}
            </span>
          </div>
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('admin.total_users')}</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.users.total}</p>
        </div>

        {/* Jobs Card */}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </span>
            <span class="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
              {t('admin.new_growth').replace('{count}', stats.overview.jobs.new.toString())}
            </span>
          </div>
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('admin.active_jobs')}</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.jobs.total}</p>
        </div>

        {/* Companies Card */}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <span class="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
              {t('admin.new_growth').replace('{count}', stats.overview.companies.new.toString())}
            </span>
          </div>
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('admin.companies')}</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.companies.total}</p>
        </div>

        {/* Engagement Card */}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </span>
          </div>
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('admin.engagement')}</h3>
          <div class="flex items-center gap-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {stats.overview.engagement.comments} <span class="text-xs font-normal ml-1">{t('admin.comments')}</span>
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {stats.overview.engagement.likes} <span class="text-xs font-normal ml-1">{t('admin.likes')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">
          {t('admin.job_trend')} - {state.selectedYear || new Date().getFullYear()}
        </h3>
        <div class="w-full">
          <LineChart
            data={stats.charts.trends.map(d => ({
              ...d,
              label: new Date(2000, parseInt(d.label), 1).toLocaleString(lang === 'it' ? 'it-IT' : 'en-US', { month: 'short' })
            }))}
            height={300}
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Jobs by Seniority */}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('admin.jobs_by_seniority')}</h3>
          <div class="space-y-4">
            {stats.charts.seniority.length > 0 ? (
              stats.charts.seniority.map((item) => {
                const percentage = stats.overview.jobs.total > 0
                  ? (item.value / stats.overview.jobs.total) * 100
                  : 0;
                return (
                  <div key={item.label} class="space-y-1">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-700 dark:text-gray-300 capitalize">{item.label}</span>
                      <span class="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p class="text-gray-500 text-sm italic">{t('admin.no_data')}</p>
            )}
          </div>
        </div>

        {/* Jobs by Employment Type */}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('admin.jobs_by_employment')}</h3>
          <div class="space-y-4">
            {stats.charts.employmentType.length > 0 ? (
              stats.charts.employmentType.map((item) => {
                const percentage = stats.overview.jobs.total > 0
                  ? (item.value / stats.overview.jobs.total) * 100
                  : 0;
                return (
                  <div key={item.label} class="space-y-1">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-700 dark:text-gray-300 capitalize">{item.label}</span>
                      <span class="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p class="text-gray-500 text-sm italic">{t('admin.no_data')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Statistics - ITJobHub',
};
