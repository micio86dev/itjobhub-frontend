import { component$, $, useStore } from "@builder.io/qwik";
import { useAuth } from "~/contexts/auth";
import { useI18n, useTranslate, type SupportedLanguage } from "~/contexts/i18n";
import { useTheme } from "~/contexts/theme";

export const Navigation = component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const theme = useTheme();
  const t = useTranslate();
  
  // Extract values and signals to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const currentLanguage = i18n.currentLanguage;
  const logoutSignal = auth.logoutSignal;
  const setLanguageSignal = i18n.setLanguageSignal;
  
  const state = useStore({
    showLanguageDropdown: false
  });

  const handleLogout = $(() => {
    // Trigger logout through signal
    logoutSignal.value = true;
  });

  const toggleLanguageDropdown = $(() => {
    state.showLanguageDropdown = !state.showLanguageDropdown;
  });

  const selectLanguage = $((lang: SupportedLanguage) => {
    console.log("selectLanguage called with:", lang);
    console.log("Current language before change:", currentLanguage);
    // Trigger language change through signal
    setLanguageSignal.value = { language: lang };
    console.log("Signal set to:", { language: lang });
    state.showLanguageDropdown = false;
  });

  const languages = [
    { code: 'it' as SupportedLanguage, name: 'Italiano', flag: '🇮🇹' },
    { code: 'en' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
    { code: 'es' as SupportedLanguage, name: 'Español', flag: '🇪🇸' },
    { code: 'de' as SupportedLanguage, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr' as SupportedLanguage, name: 'Français', flag: '🇫🇷' }
  ];

  const currentLanguageObj = languages.find(lang => lang.code === currentLanguage);

  return (
    <nav class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center min-w-0 flex-1">
            <a href="/" class="text-xl font-bold text-gray-900 dark:text-white flex-shrink-0">
              {t('nav.brand')}
            </a>
            <div class="ml-4 sm:ml-8 flex items-center space-x-1 sm:space-x-4 min-w-0">
              <a 
                href="/jobs" 
                class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                {t('nav.jobs')}
              </a>
              {user?.role === "admin" && (
                <a 
                  href="/admin/stats" 
                  class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('nav.dashboard')}
                </a>
              )}
              {isAuthenticated && (
                <a 
                  href="/favorites" 
                  class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('nav.favorites')}
                </a>
              )}
            </div>
          </div>
          
          <div class="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick$={theme.toggleTheme}
              class="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme.theme === 'light' ? (
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Language selector */}
            <div class="relative">
              <button
                onClick$={toggleLanguageDropdown}
                class="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-1 sm:px-2 py-1 rounded-md text-sm font-medium"
              >
                <span>{currentLanguageObj?.flag}</span>
                <span class="hidden md:inline">{currentLanguageObj?.name}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {state.showLanguageDropdown && (
                <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-50">
                  <div class="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick$={() => selectLanguage(lang.code)}
                        class={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          lang.code === currentLanguage ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span class="mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div class="flex items-center space-x-1 sm:space-x-3">
                <a 
                  href="/profile" 
                  class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.profile')}
                </a>
                <button 
                  onClick$={handleLogout}
                  class="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div class="flex items-center space-x-1 sm:space-x-3">
                <a 
                  href="/login" 
                  class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.login')}
                </a>
                <a 
                  href="/register" 
                  class="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('nav.register')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});