import {
  component$,
  useStore,
  $,
  useTask$,
  useStylesScoped$,
} from "@builder.io/qwik";
import { useNavigate, routeLoader$ } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import {
  useTranslate,
  translate,
  useI18n,
  type SupportedLanguage,
} from "~/contexts/i18n";
import { SocialLoginButtons } from "~/components/ui/social-login-buttons";
import styles from "./index.css?inline";

// Import translations for server-side DocumentHead
import it from "~/locales/it.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import de from "~/locales/de.json";
import fr from "~/locales/fr.json";

const translations = { it, en, es, de, fr };

export const useHeadMeta = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.login_title"] || "Login - ITJobHub",
    description:
      t["meta.login_description"] || "Sign in to your ITJobHub account",
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
        // Redirect to wizard if profile not completed, otherwise to home
        if (!auth.user?.profileCompleted) {
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
    form.loading = true;
    form.provider = "email";
    form.error = "";

    // Trigger login through signal
    auth.loginSignal.value = {
      email: form.email,
      password: form.password,
    };
  });

  const handleSocialLogin = $((provider: "google" | "linkedin" | "github") => {
    form.loading = true;
    form.provider = provider;
    // Redirect to backend OAuth URL
    const apiUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${apiUrl}/auth/oauth/${provider}`;
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
                data-testid="email-input"
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
                data-testid="password-input"
                class="inputBottom"
                placeholder={t("auth.password")}
                value={form.password}
                onInput$={(e) =>
                  (form.password = (e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>

          {form.error && <div class="errorMessage">{form.error}</div>}

          <div>
            <button
              type="submit"
              disabled={form.loading}
              data-testid="login-submit"
              class="submitButton"
            >
              {form.loading && form.provider === "email" && (
                <svg class="spinner" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="spinnerBase"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="spinnerPath"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
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
  const meta = resolveValue(useHeadMeta);
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
