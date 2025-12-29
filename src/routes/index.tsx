import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate, translate } from "~/contexts/i18n";

export default component$(() => {
  const auth = useAuth();
  const t = useTranslate();

  return (
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('home.title')}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('home.subtitle')}
          </p>
          
          {auth.isAuthenticated ? (
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('nav.hello')}, {auth.user?.name || auth.user?.email}! 👋
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                {t('auth.login_success')}
              </p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">{t('nav.jobs')}</h3>
                  <p class="text-blue-700 dark:text-blue-300 text-sm">{t('home.find_opportunities')}</p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 class="font-semibold text-green-900 dark:text-green-200 mb-2">{t('nav.profile')}</h3>
                  <p class="text-green-700 dark:text-green-300 text-sm">{t('profile.complete_desc')}</p>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 class="font-semibold text-purple-900 dark:text-purple-200 mb-2">Network</h3>
                  <p class="text-purple-700 dark:text-purple-300 text-sm">{t('home.network_with_professionals')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 max-w-2xl mx-auto">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('home.start_search')}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                {t('home.login_register_desc')}
              </p>
              <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <a
                  href="/register"
                  class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('home.register_free')}
                </a>
                <a
                  href="/login"
                  class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('home.login')}
                </a>
              </div>
            </div>
          )}
          
          <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-500 text-white">
                💼
              </div>
              <h3 class="mt-6 text-lg font-medium text-gray-900 dark:text-gray-100">{t('home.opportunities_title')}</h3>
              <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                {t('home.opportunities_desc')}
              </p>
            </div>
            
            <div class="text-center">
              <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-500 text-white">
                🚀
              </div>
              <h3 class="mt-6 text-lg font-medium text-gray-900 dark:text-gray-100">{t('home.growth_title')}</h3>
              <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                {t('home.growth_desc')}
              </p>
            </div>
            
            <div class="text-center">
              <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-500 text-white">
                🌐
              </div>
              <h3 class="mt-6 text-lg font-medium text-gray-900 dark:text-gray-100">{t('home.remote_title')}</h3>
              <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                {t('home.remote_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
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
