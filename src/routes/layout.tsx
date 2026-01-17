import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { AuthProvider, type User } from "~/contexts/auth";
import { JobsProvider } from "~/contexts/jobs";
import { I18nProvider } from "~/contexts/i18n";
import { ThemeProvider } from "~/contexts/theme";
import { Navigation } from "~/components/navigation/navigation";
import { Footer } from "~/components/footer/footer";
import logger from "~/utils/logger";

export const useAuthLoader = routeLoader$(async ({ cookie }) => {
  const token = cookie.get("auth_token")?.value;

  if (!token) return { token: null, user: null };

  try {
    // Determine API URL (handle both local and production if needed)
    // In Qwik loaders we use process.env for server-side env vars
    const API_URL = process.env.PUBLIC_API_URL || "http://localhost:3001";

    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        const bu = result.data;
        // Map backend user to frontend User interface
        const user: User = {
          id: bu.id,
          email: bu.email,
          firstName: bu.firstName,
          lastName: bu.lastName,
          name: `${bu.firstName} ${bu.lastName}`,
          role: bu.role,
          phone: bu.phone,
          location: bu.location,
          birthDate: bu.birthDate,
          bio: bu.bio,
          avatar: bu.avatar,
          languages: bu.profile?.languages || [],
          skills: bu.profile?.skills || [],
          seniority: bu.profile?.seniority,
          availability: bu.profile?.availability,
          workModes: bu.profile?.workModes || [],
          // A profile is completed if it exists
          profileCompleted: !!bu.profile,
        };
        return { token, user };
      }
    }
  } catch (e) {
    logger.error({ e }, "[SSR] Failed to fetch user data");
  }

  return {
    token: token || null,
    user: null,
  };
});

export default component$(() => {
  const authData = useAuthLoader();

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider
          initialToken={authData.value.token}
          initialUser={authData.value.user}
        >
          <JobsProvider>
            <div class="flex flex-col min-h-screen">
              <Navigation />
              <main class="flex-grow bg-gray-50 dark:bg-gray-950">
                <Slot />
              </main>
              <Footer />
            </div>
          </JobsProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
});
