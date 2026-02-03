import { component$, useStore, $, useStylesScoped$ } from "@builder.io/qwik";
import { Link, type DocumentHead, useLocation } from "@builder.io/qwik-city";
import { useTranslate, translate, useI18n } from "~/contexts/i18n";
import { Spinner } from "~/components/ui/spinner";
import styles from "./index.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();
  const t = useTranslate();
  const i18n = useI18n();

  const state = useStore({
    password: "",
    confirmPassword: "",
    loading: false,
    error: "",
    success: false,
  });

  const handleSubmit = $(async () => {
    state.loading = true;
    state.error = "";

    if (state.password !== state.confirmPassword) {
      state.error = translate("auth.password_mismatch", i18n.currentLanguage);
      state.loading = false;
      return;
    }

    if (state.password.length < 6) {
      state.error = translate("auth.password_min_length", i18n.currentLanguage);
      state.loading = false;
      return;
    }

    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:3001";
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: loc.params.token,
          password: state.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      state.success = true;
    } catch (err) {
      if (err instanceof Error) {
        state.error = err.message;
      } else {
        state.error = translate("common.unknown_error", i18n.currentLanguage);
      }
    } finally {
      state.loading = false;
    }
  });

  if (state.success) {
    return (
      <div class="loginContainer">
        <div class="loginCard">
          <div class="space-y-4 text-center">
            <h2 class="title">{t("auth.reset_success")}</h2>
            <p class="subtitle">{t("auth.reset_success_desc")}</p>
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
    <div class="loginContainer">
      <div class="loginCard">
        <div>
          <h2 class="title">{t("auth.reset_password")}</h2>
          <p class="subtitle">{t("auth.enter_new_password")}</p>
        </div>

        <form class="form" preventdefault:submit onSubmit$={handleSubmit}>
          <div class="inputGroup">
            <div>
              <label for="password" class="sr-only">
                {t("auth.new_password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="border-b-0 rounded-b-none inputSingle"
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
                class="rounded-t-none inputSingle"
                placeholder={t("auth.confirm_password")}
                value={state.confirmPassword}
                onInput$={(e) =>
                  (state.confirmPassword = (e.target as HTMLInputElement).value)
                }
              />
            </div>
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
              {state.loading ? t("common.loading") : t("auth.reset_password")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Reset Password - DevBoards.io",
  meta: [
    {
      name: "description",
      content: "Reset your password",
    },
  ],
};
