import {
  component$,
  useVisibleTask$,
  useStore,
  useStylesScoped$,
  useSignal,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate } from "~/contexts/i18n";
import { request } from "~/utils/api";
import { setCookie } from "~/utils/cookies";
import logger from "~/utils/logger";

interface CallbackState {
  loading: boolean;
  error: string;
  success: boolean;
}

import styles from "./index.css?inline";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:3001";

export default component$(() => {
  useStylesScoped$(styles);
  const location = useLocation();
  const nav = useNavigate();
  const auth = useAuth();
  const t = useTranslate();
  const processedRef = useSignal(false);

  const state = useStore<CallbackState>({
    loading: true,
    error: "",
    success: false,
  });

  // Process OAuth callback
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => location.url.href);

    // Prevent double execution
    if (processedRef.value) return;
    processedRef.value = true;

    const provider = location.params.provider;
    const code = location.url.searchParams.get("code");
    const error = location.url.searchParams.get("error");

    if (error) {
      state.loading = false;
      state.error =
        location.url.searchParams.get("error_description") ||
        "OAuth authorization was denied";
      return;
    }

    if (!code) {
      state.loading = false;
      state.error = "No authorization code received";
      return;
    }

    if (!["github", "linkedin", "google"].includes(provider)) {
      state.loading = false;
      state.error = `Invalid provider: ${provider}`;
      return;
    }

    try {
      // Exchange code for tokens with backend
      const response = await request(
        `${API_URL}/auth/oauth/${provider}/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code,
            state: location.url.searchParams.get("state"),
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const { user, token } = data.data;

        // Update auth state
        auth.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          role: user.role,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
          birthDate: user.birthDate,
          avatar: user.avatar,
          languages: user.languages || [],
          skills: user.skills || [],
          seniority: user.seniority,
          availability: user.availability,
          profileCompleted: user.profileCompleted,
        };
        auth.token = token;
        auth.isAuthenticated = true;

        // Store token in cookie
        setCookie("auth_token", token);

        state.loading = false;
        state.success = true;

        // Redirect after short delay
        setTimeout(() => {
          if (!user.profileCompleted) {
            nav("/wizard");
          } else {
            nav("/");
          }
        }, 1500);
      } else {
        state.loading = false;
        state.error = data.message || "OAuth authentication failed";
      }
    } catch (err) {
      logger.error({ err, provider }, "OAuth callback error");
      state.loading = false;
      state.error = "Failed to complete authentication. Please try again.";
    }
  });

  return (
    <div class="callback-container">
      <div class="callback-card">
        {state.loading && (
          <>
            <div class="spinner" />
            <h2 class="title">{t("auth.oauth_processing")}</h2>
            <p class="subtitle">{t("auth.oauth_please_wait")}</p>
          </>
        )}

        {state.success && (
          <>
            <svg
              class="success-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 class="title">{t("auth.oauth_success")}</h2>
            <p class="subtitle">{t("auth.oauth_redirecting")}</p>
          </>
        )}

        {state.error && (
          <>
            <svg
              class="error-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h2 class="title">{t("auth.oauth_error")}</h2>
            <div class="error-container">
              <p class="error-text">{state.error}</p>
            </div>
            <a href="/login" class="retry-link">
              {t("auth.oauth_try_again")}
            </a>
          </>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "OAuth Callback - DevBoards.io",
  meta: [
    {
      name: "description",
      content: "Processing OAuth authentication",
    },
  ],
};
