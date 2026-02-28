import { component$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  routeLoader$,
  routeAction$,
} from "@builder.io/qwik-city";
import { ContactForm } from "../../components/common/contact-form";
import { type SupportedLanguage } from "~/contexts/i18n";
import { API_URL } from "~/constants";
import { ContactPageSchema } from "~/components/seo/json-ld";

// Import translations for server-side DocumentHead
import it from "~/locales/it.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import de from "~/locales/de.json";
import fr from "~/locales/fr.json";

const translations = { it, en, es, de, fr };

// Route loader to get translated meta for DocumentHead
export const useContactHeadLoader = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.contact_title"] || "Contact Us - DevBoards.io",
    description:
      t["meta.contact_description"] ||
      "Send a message to the DevBoards.io team for support, feedback, or collaboration.",
  };
});

export const useContactAction = routeAction$(async (data, { cookie, env }) => {
  const token = cookie.get("auth_token")?.value;
  // Use env var or constant
  const apiUrl = env.get("PUBLIC_API_URL") || env.get("API_URL") || API_URL;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": "it",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${apiUrl}/messages/contact`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    await res.json();
    return { success: true };
  } catch {
    return {
      success: false,
      message: "Network error",
    };
  }
});

export default component$(() => {
  return (
    <section class="bg-brand-light-bg dark:bg-brand-dark-bg py-12 md:py-20 min-h-screen transition-colors duration-300 contact-page">
      <ContactPageSchema />
      <div class="mx-auto px-4 container">
        <ContactForm />
      </div>
    </section>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const meta = resolveValue(useContactHeadLoader);
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
