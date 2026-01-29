import {
  component$,
  useStore,
  $,
  useTask$,
  useStylesScoped$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate, translate, useI18n } from "~/contexts/i18n";
import { SocialLoginButtons } from "~/components/ui/social-login-buttons";
import { Spinner } from "~/components/ui/spinner";
import styles from "./index.css?inline";

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
  const auth = useAuth();
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

  // Watch for register results
  useTask$(({ track }) => {
    const result = track(() => auth.registerResult.value);
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
      auth.registerResult.value = null; // Clear result
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

    form.loading = true;
    form.provider = "email";

    // Use setTimeout to ensure state update is rendered before triggering the signal
    setTimeout(() => {
      // Trigger register through signal
      auth.registerSignal.value = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      };
    }, 0);
  });

  const handleSocialLogin = $((provider: "google" | "linkedin" | "github") => {
    form.loading = true;
    form.provider = provider;
    // Redirect to backend OAuth URL
    const apiUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${apiUrl}/auth/oauth/${provider}`;
  });

  return (
    <div class="registerContainer">
      <div class="registerCard">
        <div>
          <h2 class="title">{t("auth.register_title")}</h2>
          <p class="subtitle">
            {t("common.or")}{" "}
            <a href="/login" class="link">
              {t("auth.have_account")}
            </a>
          </p>
        </div>

        <form class="form" preventdefault:submit onSubmit$={handleRegister}>
          <div class="-space-y-px shadow-sm rounded-md">
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
                class="inputTop"
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
                class="inputMiddle"
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
                class="inputMiddle"
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
                class="inputMiddle"
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
                class="inputBottom"
                placeholder={t("auth.confirm_password")}
                value={form.confirmPassword}
                onInput$={(e) =>
                  (form.confirmPassword = (e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>

          {form.error && <div class="errorMessage">{form.error}</div>}

          <div>
            <button
              type="submit"
              disabled={form.loading}
              data-testid="register-form-submit-btn"
              class="py-3 w-full btn-primary"
            >
              {form.loading && form.provider === "email" && (
                <Spinner size="sm" class="inline-block mr-2 -ml-1" />
              )}
              {form.loading && form.provider === "email"
                ? t("auth.registering")
                : t("auth.register_btn")}
            </button>
          </div>
        </form>

        <div class="dividerContainer">
          <div class="dividerWrapper">
            <div class="dividerLine">
              <div class="divider" />
            </div>
            <div class="dividerTextWrapper">
              <span class="dividerText">{t("auth.or_register")}</span>
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

export const head: DocumentHead = {
  title: "Sign Up - ITJobHub",
  meta: [
    {
      name: "description",
      content: "Create your ITJobHub account",
    },
  ],
};
