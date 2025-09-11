import { component$, $, useStore } from "@builder.io/qwik";
import { useAuth } from "~/contexts/auth";
import { useI18n, type SupportedLanguage } from "~/contexts/i18n";

export const Navigation = component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  
  // Extract values and signals to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const currentLanguage = i18n.currentLanguage;
  const t = i18n.t;
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
    // Trigger language change through signal
    setLanguageSignal.value = { language: lang };
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
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <a href="/" class="text-xl font-bold text-gray-900">
              {t('nav.brand')}
            </a>
            <a 
              href="/jobs" 
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.jobs')}
            </a>
          </div>
          
          <div class="flex items-center space-x-4">
            {/* Language selector */}
            <div class="relative">
              <button
                onClick$={toggleLanguageDropdown}
                class="flex items-center space-x-1 text-gray-700 hover:text-gray-900 px-2 py-1 rounded-md text-sm font-medium"
              >
                <span>{currentLanguageObj?.flag}</span>
                <span class="hidden sm:inline">{currentLanguageObj?.name}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {state.showLanguageDropdown && (
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div class="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick$={() => selectLanguage(lang.code)}
                        class={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          lang.code === currentLanguage ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
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
              <>
                <span class="text-gray-700 hidden sm:inline">
                  {t('nav.hello')}, {user?.name || user?.email}
                </span>
                <a 
                  href="/profile" 
                  class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.profile')}
                </a>
                <button 
                  onClick$={handleLogout}
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <a 
                  href="/login" 
                  class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.login')}
                </a>
                <a 
                  href="/register" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.register')}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});