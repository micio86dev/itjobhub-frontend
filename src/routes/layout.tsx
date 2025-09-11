import { component$, Slot } from "@builder.io/qwik";
import { AuthProvider } from "~/contexts/auth";
import { JobsProvider } from "~/contexts/jobs";
import { I18nProvider } from "~/contexts/i18n";
import { ThemeProvider } from "~/contexts/theme";
import { Navigation } from "~/components/navigation/navigation";

export default component$(() => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
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