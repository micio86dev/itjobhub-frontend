import { component$, useStore, $, useTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate, translate, useI18n } from "~/contexts/i18n";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
}

export default component$(() => {
  const auth = useAuth();
  const nav = useNavigate();
  const i18n = useI18n();
  const t = useTranslate();
  
  const form = useStore<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    error: '',
    loading: false
  });

  // Watch for register results
  useTask$(({ track }) => {
    const result = track(() => auth.registerResult.value);
    if (result) {
      if (result.success) {
        // Redirect to wizard if profile not completed, otherwise to home
        if (!auth.user?.profileCompleted) {
          nav('/wizard');
        } else {
          nav('/');
        }
      } else {
        form.error = result.error || translate('auth.register_error', i18n.currentLanguage);
      }
      form.loading = false;
      auth.registerResult.value = null; // Clear result
    }
  });

  const handleRegister = $((e: Event) => {
    e.preventDefault();
    form.error = '';
    
    if (form.password !== form.confirmPassword) {
      form.error = translate('auth.password_mismatch', i18n.currentLanguage);
      return;
    }
    
    if (form.password.length < 6) {
      form.error = translate('auth.password_min_length', i18n.currentLanguage);
      return;
    }
    
    form.loading = true;
    
    // Trigger register through signal
    auth.registerSignal.value = {
      email: form.email,
      password: form.password,
      name: form.name
    };
  });

  const handleSocialLogin = $((provider: 'google' | 'linkedin' | 'github') => {
    form.loading = true;
    // Trigger social login through signal
    auth.socialLoginSignal.value = { provider };
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register_title')}
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {t('common.or')}{' '}
            <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              {t('auth.have_account')}
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" preventdefault:submit onSubmit$={handleRegister}>
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="name" class="sr-only">{t('auth.name')}</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.name')}
                value={form.name}
                onInput$={(e) => form.name = (e.target as HTMLInputElement).value}
              />
            </div>
            <div>
              <label for="email" class="sr-only">{t('auth.email')}</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.email')}
                value={form.email}
                onInput$={(e) => form.email = (e.target as HTMLInputElement).value}
              />
            </div>
            <div>
              <label for="password" class="sr-only">{t('auth.password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
                value={form.password}
                onInput$={(e) => form.password = (e.target as HTMLInputElement).value}
              />
            </div>
            <div>
              <label for="confirmPassword" class="sr-only">{t('auth.confirm_password')}</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.confirm_password')}
                value={form.confirmPassword}
                onInput$={(e) => form.confirmPassword = (e.target as HTMLInputElement).value}
              />
            </div>
          </div>

          {form.error && (
            <div class="text-red-600 text-sm text-center">
              {form.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={form.loading}
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {form.loading ? t('auth.registering') : t('auth.register_btn')}
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 text-gray-500">{t('auth.or_register')}</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-3 gap-3">
            <button
              onClick$={() => handleSocialLogin('google')}
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>

            <button
              onClick$={() => handleSocialLogin('linkedin')}
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg class="h-5 w-5" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span class="ml-2">LinkedIn</span>
            </button>

            <button
              onClick$={() => handleSocialLogin('github')}
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg class="h-5 w-5" fill="#181717" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="ml-2">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Registrati - ITJobHub',
  meta: [
    {
      name: "description",
      content: 'Crea il tuo account ITJobHub',
    },
  ],
};