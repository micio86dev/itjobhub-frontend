import { component$, useStore, $, useStylesScoped$ } from "@builder.io/qwik";
import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { type SupportedLanguage, useTranslate } from "~/contexts/i18n";
import { Spinner } from "~/components/ui/spinner";
import styles from "./index.css?inline";

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

export default component$(() => {
  useStylesScoped$(styles);
  const t = useTranslate();

  const state = useStore({
    email: "",
    loading: false,
    error: "",
    success: false,
  });

  const handleSubmit = $(async () => {
    state.loading = true;
    state.error = "";
    state.success = false;

    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:3001";
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: state.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      state.success = true;
    } catch (err) {
      if (err instanceof Error) {
        state.error = err.message;
      } else {
        state.error = "An unknown error occurred";
      }
    } finally {
      state.loading = false;
    }
  });

  return (
    <div class="loginContainer">
      <div class="loginCard">
        <div>
          <h2 class="title">{t("auth.forgot_password")}</h2>
          <p class="subtitle">{t("auth.enter_email_reset")}</p>
        </div>

        {state.success ? (
          <div class="space-y-6">
            <div class="successMessage">{t("auth.reset_link_sent")}</div>
            <p class="text-gray-600 dark:text-gray-400 text-sm text-center">
              {t("auth.reset_link_sent_desc")}
            </p>
            <div class="text-center">
              <Link href="/login" class="link">
                {t("auth.back_to_login")}
              </Link>
            </div>
          </div>
        ) : (
          <form class="form" preventdefault:submit onSubmit$={handleSubmit}>
            <div class="inputGroup">
              <label for="email" class="sr-only">
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="inputSingle"
                placeholder={t("auth.email")}
                value={state.email}
                onInput$={(e) =>
                  (state.email = (e.target as HTMLInputElement).value)
                }
              />
            </div>

            {state.error && <div class="errorMessage">{state.error}</div>}

            <div>
              <button
                type="submit"
                disabled={state.loading}
                class="py-3 w-full btn-primary"
              >
                {state.loading && (
                  <Spinner size="sm" class="inline-block mr-2 -ml-1" />
                )}
                {state.loading
                  ? t("common.loading")
                  : t("auth.send_reset_link")}
              </button>
            </div>

            <div class="text-center">
              <Link href="/login" class="text-sm link">
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
