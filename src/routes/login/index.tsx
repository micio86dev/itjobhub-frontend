import {
  component$,
  useStore,
  $,
  useTask$,
  useStylesScoped$,
} from "@builder.io/qwik";
import {
  useNavigate,
  Link,
  routeLoader$,
  useLocation,
  routeAction$,
} from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useTranslate, type SupportedLanguage } from "~/contexts/i18n";
import { SocialLoginButtons } from "~/components/ui/social-login-buttons";
import { Spinner } from "~/components/ui/spinner";
import styles from "~/css/auth.css?inline";
import { API_URL } from "~/constants";

// Import translations for server-side DocumentHead
import it from "~/locales/it.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import de from "~/locales/de.json";
import fr from "~/locales/fr.json";

const translations = { it, en, es, de, fr };

export const useLoginHeadLoader = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.login_title"] || "Login - DevBoards.io",
    description:
      t["meta.login_description"] || "Sign in to your DevBoards.io account",
  };
});

export const useLoginAction = routeAction$(async (data, { cookie, env }) => {
  const apiUrl = env.get("PUBLIC_API_URL") || env.get("API_URL") || API_URL;

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      const { token } = result.data;
      cookie.set("auth_token", token, { path: "/", httpOnly: false }); // httpOnly: false because frontend context needs to read it or at least we want to maintain existing cookie behavior
      return result;
    }
    return result;
  } catch {
    return { success: false, message: "Network error" };
  }
});

interface LoginForm {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  provider?: string;
}

export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();
  const loc = useLocation();
  const t = useTranslate();

  const form = useStore<LoginForm>({
    email: "",
    password: "",
    error: "",
    loading: false,
    provider: "",
  });

  const loginAction = useLoginAction();

  const urlError = loc.url.searchParams.get("error") || "";
  const displayError =
    form.error ||
    urlError ||
    (loginAction.value?.success === false ? loginAction.value.message : "");

  // Sync auth context when login is successful via action
  useTask$(async ({ track }) => {
    const res = track(() => loginAction.value);
    if (res?.success) {
      // We need a way to tell the auth context that we just logged in
      // Currently auth context has props initialUser and initialToken
      // But we are already on the page.
      // Easiest is to update the auth state directly if possible, or reload.
      // But let's assume we add a sync method.
      nav("/");
      // After navigation, the layout will re-run the loader and pick up the new cookie
    }
  });

  const handleLogin = $((e: Event) => {
    e.preventDefault();
    form.error = "";
    loginAction.submit({
      email: form.email,
      password: form.password,
    });
  });

  const handleSocialLogin = $((provider: "google" | "linkedin" | "github") => {
    form.loading = true;
    form.provider = provider;
    // Redirect to backend OAuth URL

    const returnUrl = loc.url.searchParams.get("returnUrl");
    const redirectQuery = returnUrl
      ? `?return_to=${encodeURIComponent(returnUrl)}`
      : "";

    window.location.href = `${API_URL}/auth/oauth/${provider}${redirectQuery}`;
  });

  return (
    <div class="auth-container">
      <div class="auth-card">
        <div>
          <h2 class="auth-title">{t("auth.login_title")}</h2>
          <p class="auth-subtitle">
            {t("common.or")}{" "}
            <Link href="/register" class="auth-link">
              {t("auth.need_account")}
            </Link>
          </p>
        </div>

        <form class="auth-form" preventdefault:submit onSubmit$={handleLogin}>
          <div class="auth-input-group">
            <div>
              <label for="email" class="sr-only">
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                data-testid="login-form-email-input"
                class="auth-input-top"
                placeholder={t("auth.email")}
                value={form.email}
                onInput$={(e) =>
                  (form.email = (e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div>
              <label for="password" class="sr-only">
                {t("auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                data-testid="login-form-password-input"
                class="auth-input-bottom"
                placeholder={t("auth.password")}
                value={form.password}
                onInput$={(e) =>
                  (form.password = (e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>

          <div class="flex justify-end items-center">
            <div class="text-sm">
              <Link href="/forgot-password" class="auth-link">
                {t("auth.forgot_password")}
              </Link>
            </div>
          </div>

          {displayError && (
            <div class="auth-error" data-testid="login-error-message">
              {displayError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loginAction.isRunning}
              data-testid="login-form-submit-btn"
              class="py-3 w-full btn-primary"
            >
              {loginAction.isRunning && (
                <Spinner size="sm" class="inline-block mr-2 -ml-1" />
              )}
              {loginAction.isRunning
                ? t("auth.logging_in")
                : t("auth.login_btn")}
            </button>
          </div>
        </form>

        <div class="auth-divider-container">
          <div class="auth-divider-wrapper">
            <div class="auth-divider-line">
              <div class="auth-divider" />
            </div>
            <div class="auth-divider-text-wrapper">
              <span class="auth-divider-text">{t("auth.or_continue")}</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <SocialLoginButtons
            onLogin$={handleSocialLogin}
            loading={form.loading}
            activeProvider={form.provider || ""}
          />
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const meta = resolveValue(useLoginHeadLoader);
  return {
    title: meta.title,
    meta: [
      {
        name: "description",
        content: meta.description,
      },
    ],
  };
};
