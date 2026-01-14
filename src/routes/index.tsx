import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate, translate, interpolate } from "~/contexts/i18n";
import { useJobs } from "~/contexts/jobs";
import { JobCard } from "~/components/jobs/job-card";

export default component$(() => {
  const auth = useAuth();
  const t = useTranslate();
  const jobsState = useJobs();
  const topSkills = useSignal<{ skill: string; count: number }[]>([]);

  // Fetch jobs and stats
  // Fetch jobs and stats
  useVisibleTask$(async () => {
    const promises = [];
    if (jobsState.jobs.length === 0) {
      promises.push(jobsState.fetchJobsPage$(1));
    }
    promises.push(jobsState.fetchTopSkills$(10, new Date().getFullYear()).then(skills => {
      topSkills.value = skills;
    }));
    await Promise.all(promises);
  });

  const recentJobs = jobsState.jobs.slice(0, 3); // Top 3 jobs

  return (
    <div class="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section class="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white py-24 sm:py-32">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            <span class="block">{t('home.title')}</span>
            <span class="block text-indigo-200 mt-2 text-2xl sm:text-4xl">{t('home.subtitle')}</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-xl text-indigo-100 mb-10">
            {t('home.opportunities_desc')}
          </p>

          {/* Search Box */}
          <div class="max-w-3xl mx-auto">
            <form action="/jobs" method="get" class="relative group">
              <div class="absolute inset-0 bg-pink-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div class="relative bg-white rounded-lg p-2 shadow-xl flex items-center">
                <span class="pl-4 text-gray-400">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="q"
                  placeholder={t('home.start_search')}
                  class="flex-1 p-4 text-gray-900 placeholder-gray-500 focus:outline-none rounded-lg"
                />
                <button
                  type="submit"
                  class="bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-200 hidden sm:block"
                >
                  {t('home.search_button') || 'Cerca'}
                </button>
              </div>
            </form>
            <div class="mt-4 text-sm text-indigo-200 flex flex-wrap gap-2 items-center justify-center sm:justify-start">
              <span class="font-medium opacity-80 mr-1">{t('home.popular')}</span>
              {topSkills.value.length > 0 ? (
                topSkills.value.slice(0, 6).map(s => (
                  <a
                    key={s.skill}
                    href={`/jobs?q=${encodeURIComponent(s.skill)}`}
                    class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors"
                  >
                    {s.skill}
                  </a>
                ))
              ) : (
                <>
                  <a href="/jobs?q=Frontend" class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors">Frontend</a>
                  <a href="/jobs?q=Backend" class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors">Backend</a>
                  <a href="/jobs?q=Fullstack" class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors">Fullstack</a>
                </>
              )}
              <a href="/jobs?remote=true" class="hover:text-white underline decoration-dashed underline-offset-4 transition-colors">{t('jobs.remote')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section class="bg-indigo-50 dark:bg-gray-800 py-12 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
            <div class="p-6">
              <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">1,200+</div>
              <div class="text-gray-600 dark:text-gray-300 font-medium">{t('home.active_jobs_stat')}</div>
            </div>
            <div class="p-6">
              <div class="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">350+</div>
              <div class="text-gray-600 dark:text-gray-300 font-medium">{t('home.companies_stat')}</div>
            </div>
            <div class="p-6">
              <div class="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">15k+</div>
              <div class="text-gray-600 dark:text-gray-300 font-medium">{t('home.developers_stat')}</div>
            </div>
          </div>

          {/* Top Skills Chart */}
          {topSkills.value.length > 0 && (
            <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 transform hover:scale-[1.01] transition-transform duration-300">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                🔥 {t('home.top_skills_title') || interpolate(t('home.top_skills_year'), { year: new Date().getFullYear() })}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topSkills.value.slice(0, 10).map((skill, index) => (
                  <div key={skill.skill} class="relative group">
                    <div class="flex justify-between mb-2">
                      <span class="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                        <span class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </span>
                        {skill.skill}
                      </span>
                      <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">{interpolate(t('home.jobs_count'), { count: skill.count })}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out group-hover:from-indigo-400 group-hover:to-pink-400"
                        style={{ width: `${(skill.count / topSkills.value[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section class="py-16 bg-white dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-end mb-10">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('home.recent_jobs_title') || 'Nuove Offerte'}
              </h2>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                {t('home.recent_jobs_subtitle') || 'Scopri le ultime opportunità inserite'}
              </p>
            </div>
            <a href="/jobs" class="hidden sm:flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              {t('home.view_all_jobs') || 'Vedi tutti'}
              <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobsState.jobs.length > 0 ? (
              recentJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              // Skeletons
              [1, 2, 3].map(i => (
                <div key={i} class="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse"></div>
              ))
            )}
          </div>

          <div class="mt-10 text-center sm:hidden">
            <a href="/jobs" class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
              {t('home.view_all_jobs') || 'Vedi tutti i lavori'}
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us / Value Props */}
      <section class="py-16 bg-gray-50 dark:bg-black/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('home.why_us_title') || 'Perché IT Job Hub?'}</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div class="text-center group p-6 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl">
              <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                💼
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.opportunities_title')}</h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.opportunities_desc')}</p>
            </div>
            <div class="text-center group p-6 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl">
              <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-pink-100 text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                🚀
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.growth_title')}</h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.growth_desc')}</p>
            </div>
            <div class="text-center group p-6 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl">
              <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                🌐
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.remote_title')}</h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.remote_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="relative bg-indigo-900 py-16 sm:py-24">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          <div class="absolute right-0 top-0 -mt-20 -mr-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div class="absolute left-0 bottom-0 -mb-20 -ml-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        <div class="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            {t('home.cta_title')}
          </h2>
          <p class="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            {t('home.cta_desc')}
          </p>
          {!auth.isAuthenticated && (
            <div class="flex justify-center space-x-4">
              <a href="/register" class="bg-white text-indigo-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                {t('home.register_free')}
              </a>
              <a href="/login" class="bg-transparent border-2 border-indigo-400 text-indigo-100 px-8 py-4 rounded-lg font-bold hover:bg-indigo-800/50 transition-colors">
                {t('home.login')}
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = () => {
  const t = (key: string) => translate(key, 'it');
  return {
    title: t('meta.index_title'),
    meta: [
      {
        name: "description",
        content: t('meta.index_description'),
      },
    ],
  };
};
