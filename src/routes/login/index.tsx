import {
  component$,
  useStore,
  $,
  useTask$,
  useStylesScoped$,
} from "@builder.io/qwik";
import { useNavigate, routeLoader$, useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import {
  useTranslate,
  translate,
  useI18n,
  type SupportedLanguage,
} from "~/contexts/i18n";
import { SocialLoginButtons } from "~/components/ui/social-login-buttons";
import { Spinner } from "~/components/ui/spinner";
import styles from "./index.css?inline";

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

interface LoginForm {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  provider?: string;
}

export default component$(() => {
  useStylesScoped$(styles);
  const auth = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const i18n = useI18n();
  const t = useTranslate();

  const form = useStore<LoginForm>({
    email: "",
    password: "",
    error: "",
    loading: false,
    provider: "",
  });

  // Watch for login results
  useTask$(({ track }) => {
    const result = track(() => auth.loginResult.value);
    if (result) {
      if (result.success) {
        const returnUrl = loc.url.searchParams.get("returnUrl");
        // Redirect to wizard if profile not completed, otherwise to home or returnUrl
        if (returnUrl) {
          nav(returnUrl);
        } else if (!auth.user?.profileCompleted) {
          nav("/wizard");
        } else {
          nav("/");
        }
      } else {
        form.error =
          result.error ||
          translate("auth.register_error", i18n.currentLanguage);
      }
      form.loading = false;
      form.provider = "";
      auth.loginResult.value = null; // Clear result
    }
  });

  const handleLogin = $((e: Event) => {
    e.preventDefault();

    // Set loading state FIRST
    form.loading = true;
    form.provider = "email";
    form.error = "";

    // Use setTimeout to ensure state update is rendered before triggering the signal
    // This gives Qwik a chance to re-render with the loading state
    setTimeout(() => {
      // Trigger login through signal
      auth.loginSignal.value = {
        email: form.email,
        password: form.password,
      };
    }, 0);
  });

  const handleSocialLogin = $((provider: "google" | "linkedin" | "github") => {
    form.loading = true;
    form.provider = provider;
    // Redirect to backend OAuth URL
    const apiUrl = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:3001";

    const returnUrl = loc.url.searchParams.get("returnUrl");
    const redirectQuery = returnUrl
      ? `?return_to=${encodeURIComponent(returnUrl)}`
      : "";

    window.location.href = `${apiUrl}/auth/oauth/${provider}${redirectQuery}`;
  });

  return (
    <div class="loginContainer">
      <div class="loginCard">
        <div>
          <h2 class="title">{t("auth.login_title")}</h2>
          <p class="subtitle">
            {t("common.or")}{" "}
            <a href="/register" class="link">
              {t("auth.need_account")}
            </a>
          </p>
        </div>

        <form class="form" preventdefault:submit onSubmit$={handleLogin}>
          <div class="inputGroup">
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
                class="inputTop"
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
                class="inputBottom"
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
              <a
                href="/forgot-password"
                class="font-medium text-brand-neon hover:text-brand-neon/80"
              >
                {t("auth.forgot_password")}
              </a>
            </div>
          </div>

          {form.error && <div class="errorMessage">{form.error}</div>}

          <div>
            <button
              type="submit"
              disabled={form.loading}
              data-testid="login-form-submit-btn"
              class="py-3 w-full btn-primary"
            >
              {form.loading && form.provider === "email" && (
                <Spinner size="sm" class="inline-block mr-2 -ml-1" />
              )}
              {form.loading && form.provider === "email"
                ? t("auth.logging_in")
                : t("auth.login_btn")}
            </button>
          </div>
        </form>

        <div class="dividerContainer">
          <div class="dividerWrapper">
            <div class="dividerLine">
              <div class="divider" />
            </div>
            <div class="dividerTextWrapper">
              <span class="dividerText">{t("auth.or_continue")}</span>
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
