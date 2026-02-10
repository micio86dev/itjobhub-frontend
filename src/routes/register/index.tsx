import {
  component$,
  useStore,
  $,
  useTask$,
  useStylesScoped$,
} from "@builder.io/qwik";
import {
  useNavigate,
  routeLoader$,
  routeAction$,
  Link,
} from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  useTranslate,
  translate,
  useI18n,
  type SupportedLanguage,
} from "~/contexts/i18n";
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

export const useRegisterHeadLoader = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.register_title"] || "Sign Up - DevBoards.io",
    description:
      t["meta.register_description"] || "Create your DevBoards.io account",
  };
});

export const useRegisterAction = routeAction$(async (data, { cookie, env }) => {
  const apiUrl = env.get("PUBLIC_API_URL") || env.get("API_URL") || API_URL;

  try {
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.status === 201 && result.success) {
      const { token } = result.data;
      cookie.set("auth_token", token, { path: "/", httpOnly: false });
      return result;
    }
    return result;
  } catch {
    return { success: false, message: "Network error" };
  }
});

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
  provider?: string;
}

export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();
  const i18n = useI18n();
  const t = useTranslate();

  const form = useStore<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
    loading: false,
    provider: "",
  });

  const registerAction = useRegisterAction();

  // Watch for register results
  useTask$(async ({ track }) => {
    const res = track(() => registerAction.value);
    if (res?.success) {
      // Logic from auth context: redirect to wizard or home
      nav("/wizard");
    }
  });

  const handleRegister = $((e: Event) => {
    e.preventDefault();
    form.error = "";

    if (form.password !== form.confirmPassword) {
      form.error = translate("auth.password_mismatch", i18n.currentLanguage);
      return;
    }

    if (form.password.length < 6) {
      form.error = translate("auth.password_min_length", i18n.currentLanguage);
      return;
    }

    registerAction.submit({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
    });
  });

  const handleSocialLogin = $((provider: "google" | "linkedin" | "github") => {
    form.loading = true;
    form.provider = provider;
    // Redirect to backend OAuth URL

    window.location.href = `${API_URL}/auth/oauth/${provider}`;
  });

  return (
    <div class="auth-container">
      <div class="auth-card">
        <div>
          <h2 class="auth-title">{t("auth.register_title")}</h2>
          <p class="auth-subtitle">
            {t("common.or")}{" "}
            <Link href="/login" class="auth-link">
              {t("auth.have_account")}
            </Link>
          </p>
        </div>

        <form
          class="auth-form"
          preventdefault:submit
          onSubmit$={handleRegister}
        >
          <div class="auth-input-group">
            <div>
              <label for="firstName" class="sr-only">
                {t("auth.first_name")}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                data-testid="register-form-firstname-input"
                class="auth-input-top"
                placeholder={t("auth.first_name")}
                value={form.firstName}
                onInput$={(e) =>
                  (form.firstName = (e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div>
              <label for="lastName" class="sr-only">
                {t("auth.last_name")}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                data-testid="register-form-lastname-input"
                class="auth-input-middle"
                placeholder={t("auth.last_name")}
                value={form.lastName}
                onInput$={(e) =>
                  (form.lastName = (e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div>
              <label for="email" class="sr-only">
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                data-testid="register-form-email-input"
                class="auth-input-middle"
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
                data-testid="register-form-password-input"
                class="auth-input-middle"
                placeholder={t("auth.password")}
                value={form.password}
                onInput$={(e) =>
                  (form.password = (e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div>
              <label for="confirmPassword" class="sr-only">
                {t("auth.confirm_password")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                data-testid="register-form-confirm-password-input"
                class="auth-input-bottom"
                placeholder={t("auth.confirm_password")}
                value={form.confirmPassword}
                onInput$={(e) =>
                  (form.confirmPassword = (e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>

          {form.error ||
            ((registerAction.value?.success === false
              ? registerAction.value.message
              : "") && (
              <div class="auth-error">
                {form.error || registerAction.value?.message}
              </div>
            ))}

          <div>
            <button
              type="submit"
              disabled={registerAction.isRunning}
              data-testid="register-form-submit-btn"
              class="py-3 w-full btn-primary"
            >
              {registerAction.isRunning && (
                <Spinner size="sm" class="inline-block mr-2 -ml-1" />
              )}
              {registerAction.isRunning
                ? t("auth.registering")
                : t("auth.register_btn")}
            </button>
          </div>
        </form>

        <div class="auth-divider-container">
          <div class="auth-divider-wrapper">
            <div class="auth-divider-line">
              <div class="auth-divider" />
            </div>
            <div class="auth-divider-text-wrapper">
              <span class="auth-divider-text">{t("auth.or_register")}</span>
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
  const meta = resolveValue(useRegisterHeadLoader);
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
