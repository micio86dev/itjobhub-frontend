import { component$, $, useStore, useStylesScoped$ } from "@builder.io/qwik";
import { useTranslate } from "../../contexts/i18n";
import { useAuth } from "../../contexts/auth";
import styles from "./contact-form.css?inline";

export const ContactForm = component$(() => {
  useStylesScoped$(styles);
  const t = useTranslate();
  const auth = useAuth();
  const state = useStore({
    name: "",
    email: "",
    type: "general",
    message: "",
    isSubmitting: false,
    isSuccess: false,
    error: null as string | null,
  });

  const errorDesc = t("contact.error_desc");
  const handleSubmit$ = $(async (e: Event) => {
    e.preventDefault();
    state.isSubmitting = true;
    state.error = null;

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept-Language": "it",
      };

      if (auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(`${apiBaseUrl}/contact`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: auth.token ? undefined : state.name,
          email: auth.token ? undefined : state.email,
          type: state.type,
          message: state.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        state.isSuccess = true;
      } else {
        state.error = result.message || errorDesc;
      }
    } catch {
      state.error = "Connection error. Please try again later.";
    } finally {
      state.isSubmitting = false;
    }
  });

  if (state.isSuccess) {
    return (
      <div class="contact-card glass-effect feedback-container">
        <div class="feedback-icon-wrapper success-icon-wrapper">
          <svg
            class="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 class="feedback-title">{t("contact.success_title")}</h2>
        <p class="feedback-description">{t("contact.success_desc")}</p>
        <button
          onClick$={() => {
            state.isSuccess = false;
            state.name = "";
            state.email = "";
            state.message = "";
            state.type = "general";
          }}
          class="btn-primary"
        >
          {t("contact.send_another")}
        </button>
      </div>
    );
  }

  return (
    <form
      preventdefault:submit
      onSubmit$={handleSubmit$}
      method="post"
      class="contact-card"
    >
      <div class="contact-header">
        <h1 class="contact-title">{t("contact.title")}</h1>
        <p class="contact-subtitle">{t("contact.subtitle")}</p>
      </div>

      {state.error && (
        <div class="error-container">
          <svg
            class="flex-shrink-0 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="font-medium text-sm">{state.error}</span>
        </div>
      )}

      {!auth.token && (
        <div class="form-grid">
          <div class="form-group">
            <label for="name" class="form-label">
              {t("contact.name")}
            </label>
            <input
              id="name"
              type="text"
              value={state.name}
              onInput$={(e) =>
                (state.name = (e.target as HTMLInputElement).value)
              }
              required
              class="form-input"
              placeholder={t("contact.name_placeholder")}
            />
          </div>
          <div class="form-group">
            <label for="email" class="form-label">
              {t("contact.email")}
            </label>
            <input
              id="email"
              type="email"
              value={state.email}
              onInput$={(e) =>
                (state.email = (e.target as HTMLInputElement).value)
              }
              required
              class="form-input"
              placeholder={t("contact.email_placeholder")}
            />
          </div>
        </div>
      )}

      <div class="form-group">
        <label for="type" class="form-label">
          {t("contact.type")}
        </label>
        <select
          id="type"
          value={state.type}
          onChange$={(e) =>
            (state.type = (e.target as HTMLSelectElement).value)
          }
          class="form-select"
        >
          <option value="general">{t("contact.type.general")}</option>
          <option value="error">{t("contact.type.error")}</option>
          <option value="participation">
            {t("contact.type.participation")}
          </option>
          <option value="other">{t("contact.type.other")}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="message" class="form-label">
          {t("contact.message")}
        </label>
        <textarea
          id="message"
          value={state.message}
          onInput$={(e) =>
            (state.message = (e.target as HTMLTextAreaElement).value)
          }
          required
          minLength={10}
          rows={5}
          class="form-textarea"
          placeholder={t("contact.message_placeholder")}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={state.isSubmitting}
        class="btn-primary submit-button"
      >
        {state.isSubmitting ? (
          <div class="flex justify-center items-center gap-3">
            <svg
              class="w-5 h-5 text-current animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{t("contact.sending")}</span>
          </div>
        ) : (
          t("contact.send_button")
        )}
      </button>
    </form>
  );
});
