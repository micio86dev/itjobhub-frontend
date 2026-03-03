/**
 * CookieConsent — GDPR-compliant informative cookie banner
 *
 * Legal basis:
 * - Technical cookies (auth_token, preferred-language) are strictly necessary
 *   under Art. 122(1) Codice Privacy / ePrivacy Directive 5(3) — no consent required.
 * - Microsoft Clarity operates in cookieless mode (no tracking cookies) and is
 *   therefore GDPR-friendly without explicit user consent.
 * - This banner fulfils the transparency obligation under GDPR Art. 13 and the
 *   Italian Garante guidelines on cookies (10 June 2021).
 *
 * UX:
 * - Shown once per 180 days, stored in localStorage (not a cookie).
 * - Fixed to the bottom of the viewport.
 * - Expandable details panel for full transparency.
 * - Fully keyboard-navigable and screen-reader announced.
 */

import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

const STORAGE_KEY = "devboards_cookie_notice";
/** Re-show the notice after this many milliseconds (180 days) */
const NOTICE_TTL_MS = 180 * 24 * 60 * 60 * 1_000;

export const CookieConsent = component$(() => {
  const t = useTranslate();
  const visible = useSignal(false);
  const expanded = useSignal(false);

  // Runs client-side only after hydration — determines whether to show the banner

  useVisibleTask$(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        visible.value = true;
        return;
      }
      const parsed = JSON.parse(raw) as { ts?: number };
      if (!parsed.ts || Date.now() - parsed.ts > NOTICE_TTL_MS) {
        visible.value = true;
      }
    } catch {
      visible.value = true;
    }
  });

  const dismiss$ = $(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
    } catch {
      /* ignore write failures (e.g. private browsing) */
    }
    visible.value = false;
  });

  return (
    <>
      {visible.value && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t("cookie.aria_label")}
          aria-live="polite"
          class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <div class="container mx-auto max-w-5xl px-4 py-4">
            {/* ── Main row ─────────────────────────────────────────────── */}
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p class="flex-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t("cookie.banner_text")}{" "}
                <a
                  href="/privacy-policy"
                  class="rounded underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-brand-neon"
                  style="color: var(--color-brand-neon, #39ff14)"
                >
                  {t("cookie.privacy_link")}
                </a>{" "}
                &amp;{" "}
                <a
                  href="/cookie-policy"
                  class="rounded underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-brand-neon"
                  style="color: var(--color-brand-neon, #39ff14)"
                >
                  {t("cookie.policy_link")}
                </a>
                .
              </p>

              <div class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick$={() => {
                    expanded.value = !expanded.value;
                  }}
                  aria-expanded={expanded.value}
                  aria-controls="cookie-details"
                  class="rounded px-2 py-1 text-sm text-gray-500 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-brand-neon dark:text-gray-400"
                >
                  {t("cookie.customize")}
                </button>

                <button
                  type="button"
                  onClick$={dismiss$}
                  class="shrink-0 rounded-lg bg-brand-neon px-4 py-2 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  {t("cookie.accept")}
                </button>
              </div>
            </div>

            {/* ── Expandable details ────────────────────────────────────── */}
            {expanded.value && (
              <div
                id="cookie-details"
                class="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800"
              >
                {/* Necessary cookies */}
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("cookie.necessary_title")}
                      </p>
                      <p class="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        {t("cookie.necessary_desc")}
                      </p>
                    </div>
                    <span class="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      {t("cookie.necessary_always")}
                    </span>
                  </div>
                </div>

                {/* Analytics — cookieless */}
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {t("cookie.analytics_title")}
                        </p>
                        <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                          {t("cookie.cookieless_badge")} ✓
                        </span>
                      </div>
                      <p class="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        {t("cookie.analytics_desc")}
                      </p>
                    </div>
                    <span class="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      {t("cookie.necessary_always")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
