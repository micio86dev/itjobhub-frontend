import { component$, useStore, $, useStylesScoped$ } from "@builder.io/qwik";
import {
  Link,
  routeLoader$,
  type DocumentHead,
  routeAction$,
} from "@builder.io/qwik-city";
import { type SupportedLanguage, useTranslate } from "~/contexts/i18n";
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

// Route loader to get translated meta for DocumentHead
export const useForgotPassHeadLoader = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.forgot_password_title"] || "Forgot Password - DevBoards.io",
    description: t["meta.forgot_password_desc"] || "Reset your password",
  };
});

export const useForgotPasswordAction = routeAction$(async (data, { env }) => {
  const apiUrl = env.get("PUBLIC_API_URL") || env.get("API_URL") || API_URL;

  try {
    const res = await fetch(`${apiUrl}/auth/forgot-password`, {
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
  const t = useTranslate();
  const forgotPasswordAction = useForgotPasswordAction();

  const state = useStore({
    email: "",
  });

  const handleSubmit = $(async () => {
    forgotPasswordAction.submit({ email: state.email });
  });

  const isSuccess = forgotPasswordAction.value?.success;
  const displayError =
    forgotPasswordAction.value?.success === false
      ? forgotPasswordAction.value.message
      : "";

  return (
    <div class="auth-container">
      <div class="auth-card">
        <div>
          <h2 class="auth-title">{t("auth.forgot_password")}</h2>
          <p class="auth-subtitle">{t("auth.enter_email_reset")}</p>
        </div>

        {isSuccess ? (
          <div class="space-y-6">
            <div class="auth-success">{t("auth.reset_link_sent")}</div>
            <p class="text-gray-600 dark:text-gray-400 text-sm text-center">
              {t("auth.reset_link_sent_desc")}
            </p>
            <div class="text-center">
              <Link href="/login" class="auth-link">
                {t("auth.back_to_login")}
              </Link>
            </div>
          </div>
        ) : (
          <form
            class="auth-form"
            preventdefault:submit
            onSubmit$={handleSubmit}
          >
            <div class="auth-input-group">
              <label for="email" class="sr-only">
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="auth-input-single"
                placeholder={t("auth.email")}
                value={state.email}
                onInput$={(e) =>
                  (state.email = (e.target as HTMLInputElement).value)
                }
              />
            </div>

            {displayError && <div class="auth-error">{displayError}</div>}

            <div>
              <button
                type="submit"
                disabled={forgotPasswordAction.isRunning}
                class="py-3 w-full btn-primary"
              >
                {forgotPasswordAction.isRunning && (
                  <Spinner size="sm" class="inline-block mr-2 -ml-1" />
                )}
                {forgotPasswordAction.isRunning
                  ? t("common.loading")
                  : t("auth.send_reset_link")}
              </button>
            </div>

            <div class="text-center">
              <Link href="/login" class="auth-link">
                {t("auth.back_to_login")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const meta = resolveValue(useForgotPassHeadLoader);
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
