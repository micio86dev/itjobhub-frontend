import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { AuthProvider, type User } from "~/contexts/auth";
import { JobsProvider } from "~/contexts/jobs";
import { I18nProvider } from "~/contexts/i18n";
import { ThemeProvider } from "~/contexts/theme";
import { Navigation } from "~/components/navigation/navigation";

export const useAuthLoader = routeLoader$(({ cookie }) => {
  const token = cookie.get('auth_token')?.value;
  const userStr = cookie.get('auth_user')?.value;

  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(decodeURIComponent(userStr));
    } catch {
      console.error('Failed to parse auth_user cookie');
    }
  }

  return {
    token: token || null,
    user: user
  };
});

export default component$(() => {
  const authData = useAuthLoader();

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider initialToken={authData.value.token} initialUser={authData.value.user}>
          <JobsProvider>
            <Navigation />
            <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Slot />
            </main>
          </JobsProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
});