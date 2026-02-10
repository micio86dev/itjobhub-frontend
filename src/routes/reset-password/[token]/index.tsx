import { component$, useStore, $, useStylesScoped$ } from "@builder.io/qwik";
import {
  Link,
  type DocumentHead,
  useLocation,
  routeAction$,
  routeLoader$,
} from "@builder.io/qwik-city";
import {
  useTranslate,
  translate,
  useI18n,
  type SupportedLanguage,
} from "~/contexts/i18n";
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

export const useResetPasswordHeadLoader = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.reset_password_title"] || "Reset Password - DevBoards.io",
    description: t["meta.reset_password_desc"] || "Reset your password",
  };
});

export const useResetPasswordAction = routeAction$(async (data, { env }) => {
  const apiUrl = env.get("PUBLIC_API_URL") || env.get("API_URL") || API_URL;

  try {
    const res = await fetch(`${apiUrl}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    return result;
  } catch {
    return { success: false, message: "Network error" };
  }
});

export default component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();
  const t = useTranslate();
  const i18n = useI18n();
  const resetAction = useResetPasswordAction();

  const state = useStore({
    password: "",
    confirmPassword: "",
    error: "",
  });

  const handleSubmit = $(async () => {
    state.error = "";

    if (state.password !== state.confirmPassword) {
      state.error = translate("auth.password_mismatch", i18n.currentLanguage);
      return;
    }

    if (state.password.length < 6) {
      state.error = translate("auth.password_min_length", i18n.currentLanguage);
      return;
    }

    resetAction.submit({
      token: loc.params.token,
      password: state.password,
    });
  });

  const isSuccess = resetAction.value?.success;
  const displayError =
    state.error ||
    (resetAction.value?.success === false ? resetAction.value.message : "");

  if (isSuccess) {
    return (
      <div class="auth-container">
        <div class="auth-card">
          <div class="space-y-4 text-center">
            <h2 class="auth-title">{t("auth.reset_success")}</h2>
            <p class="auth-subtitle">{t("auth.reset_success_desc")}</p>
            <div class="pt-4">
              <Link
                href="/login"
                class="inline-block py-3 w-full text-center btn-primary"
              >
                {t("auth.back_to_login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="auth-container">
      <div class="auth-card">
        <div>
          <h2 class="auth-title">{t("auth.reset_password")}</h2>
          <p class="auth-subtitle">{t("auth.enter_new_password")}</p>
        </div>

        <form class="auth-form" preventdefault:submit onSubmit$={handleSubmit}>
          <div class="auth-input-group">
            <div>
              <label for="password" class="sr-only">
                {t("auth.new_password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="auth-input-top"
                placeholder={t("auth.new_password")}
                value={state.password}
                onInput$={(e) =>
                  (state.password = (e.target as HTMLInputElement).value)
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
                class="auth-input-bottom"
                placeholder={t("auth.confirm_password")}
                value={state.confirmPassword}
                onInput$={(e) =>
                  (state.confirmPassword = (e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>

          {displayError && <div class="auth-error">{displayError}</div>}

          <div>
            <button
              type="submit"
              disabled={resetAction.isRunning}
              class="py-3 w-full btn-primary"
            >
              {resetAction.isRunning && (
                <Spinner size="sm" class="inline-block mr-2 -ml-1" />
              )}
              {resetAction.isRunning
                ? t("common.loading")
                : t("auth.reset_password")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const meta = resolveValue(useResetPasswordHeadLoader);
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
