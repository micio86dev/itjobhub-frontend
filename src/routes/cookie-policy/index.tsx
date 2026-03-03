import { component$ } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { useTranslate, type SupportedLanguage } from "~/contexts/i18n";

// Import translations for server-side DocumentHead
import it from "~/locales/it.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import de from "~/locales/de.json";
import fr from "~/locales/fr.json";

const translations = { it, en, es, de, fr };

export const useCookiePolicyHeadLoader = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: (t["cookie_policy.title"] || "Cookie Policy") + " - DevBoards.io",
    description:
      lang === "it"
        ? "Informativa completa sull'uso dei cookie su DevBoards.io: cookie tecnici, analisi cookieless con Microsoft Clarity."
        : "Full cookie policy for DevBoards.io: technical cookies and cookieless analytics with Microsoft Clarity.",
  };
});

export default component$(() => {
  const t = useTranslate();

  return (
    <div class="container mx-auto max-w-4xl px-4 py-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <h1 class="mb-2 text-3xl font-bold dark:text-white">
        {t("cookie_policy.title")}
      </h1>
      <p class="mb-8 text-gray-600 dark:text-gray-400">
        {t("cookie_policy.last_updated")}
      </p>

      <div class="space-y-8 leading-relaxed text-gray-800 dark:text-gray-200">
        {/* ── 1. Intro ───────────────────────────────────────────────────── */}
        <section>
          <h2 class="mb-4 text-2xl font-bold tracking-tight text-brand-neon">
            {t("cookie_policy.intro_title")}
          </h2>
          <p>{t("cookie_policy.intro_text")}</p>
        </section>

        {/* ── 2. Technical Cookies ────────────────────────────────────────── */}
        <section>
          <h2 class="mb-4 text-2xl font-bold tracking-tight text-brand-neon">
            {t("cookie_policy.technical_title")}
          </h2>
          <p class="mb-4">{t("cookie_policy.technical_text")}</p>

          {/* Cookie table */}
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {t("cookie_policy.table_name")}
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {t("cookie_policy.table_purpose")}
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {t("cookie_policy.table_duration")}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                <tr>
                  <td class="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                    auth_token
                  </td>
                  <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {t("cookie_policy.auth_token_purpose")}
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {t("cookie_policy.auth_token_duration")}
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                    preferred-language
                  </td>
                  <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {t("cookie_policy.lang_purpose")}
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {t("cookie_policy.lang_duration")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 3. Cookieless Analytics ─────────────────────────────────────── */}
        <section>
          <h2 class="mb-4 text-2xl font-bold tracking-tight text-brand-neon">
            {t("cookie_policy.analytics_title")}
          </h2>
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clip-rule="evenodd"
                />
              </svg>
              Cookieless — Microsoft Clarity
            </span>
          </div>
          <p>{t("cookie_policy.analytics_text")}</p>
          <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <a
              href="https://privacy.microsoft.com/privacystatement"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:no-underline"
              style="color: var(--color-brand-neon, #39ff14)"
            >
              Microsoft Privacy Statement ↗
            </a>
          </p>
        </section>

        {/* ── 4. Managing cookies ─────────────────────────────────────────── */}
        <section>
          <h2 class="mb-4 text-2xl font-bold tracking-tight text-brand-neon">
            {t("cookie_policy.manage_title")}
          </h2>
          <p>{t("cookie_policy.manage_text")}</p>

          {/* Browser quick links */}
          <ul class="mt-3 space-y-1 text-sm">
            {[
              {
                browser: "Chrome",
                url: "https://support.google.com/chrome/answer/95647",
              },
              {
                browser: "Firefox",
                url: "https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox",
              },
              {
                browser: "Safari",
                url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac",
              },
              {
                browser: "Edge",
                url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
              },
            ].map((item) => (
              <li key={item.browser}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline hover:no-underline text-gray-700 dark:text-gray-300"
                >
                  {item.browser} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 5. Contact ─────────────────────────────────────────────────── */}
        <section>
          <h2 class="mb-4 text-2xl font-bold tracking-tight text-brand-neon">
            {t("cookie_policy.contact_title")}
          </h2>
          <p>{t("cookie_policy.contact_text")}</p>
        </section>

        {/* ── Back link ──────────────────────────────────────────────────── */}
        <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
          <a
            href="/privacy-policy"
            class="text-sm underline hover:no-underline"
            style="color: var(--color-brand-neon, #39ff14)"
          >
            {t("cookie_policy.back_privacy")}
          </a>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const meta = resolveValue(useCookiePolicyHeadLoader);
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
