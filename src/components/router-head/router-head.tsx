import { component$, useServerData } from "@builder.io/qwik";
import { trustHtml, trustScript } from "~/utils/trusted-types";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";
import type { SupportedLanguage } from "~/contexts/i18n";
import { SITE_URL } from "~/constants";

// Base URL for production - update this when deploying

// Supported languages for hreflang
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["it", "en", "es", "de", "fr"];

// Language to locale mapping for Open Graph
const LOCALE_MAP: Record<SupportedLanguage, string> = {
  it: "it_IT",
  en: "en_US",
  es: "es_ES",
  de: "de_DE",
  fr: "fr_FR",
};

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 * It handles SEO meta tags, hreflang, Open Graph, and Twitter Cards.
 *
 * Note: This component cannot use useI18n() because it's rendered in root.tsx
 * inside <head>, before the I18nProvider (which is in layout.tsx inside RouterOutlet).
 * We use Italian as the default language for SEO purposes.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  const nonce = useServerData<string | undefined>("nonce");

  // Determine language from query param or fallback to 'it' (default)
  // We strictly use URL state for SEO meta tags to match the content being served
  const queryLang = loc.url.searchParams.get("lang");
  const currentLang: SupportedLanguage =
    queryLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(queryLang)
      ? (queryLang as SupportedLanguage)
      : "it";

  const pathname = loc.url.pathname;

  // Environment detection
  const isProduction = import.meta.env.MODE === "production";
  const isStaging = import.meta.env.MODE === "staging";
  const isDev = import.meta.env.DEV;

  // Force noindex if not officially in production (covers dev, staging, or other testing envs)
  const shouldNoIndex = isDev || isStaging || !isProduction;

  // Build canonical URL (include lang param if not default)
  // Ensure we don't have double slashes if pathname starts with one
  const canonicalUrl = `${SITE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}${currentLang !== "it" ? `?lang=${currentLang}` : ""}`;

  return (
    <>
      <title>{head.title}</title>

      {/* Robots meta tag to prevent indexing in non-prod environments */}
      {shouldNoIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Language attribute for the document */}
      <meta httpEquiv="content-language" content={currentLang} />

      {/* hreflang tags - Point to specific language versions via query param */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hreflang={lang}
          href={`${SITE_URL}${pathname}${lang !== "it" ? `?lang=${lang}` : ""}`}
        />
      ))}
      {/* x-default points to the default version (Italian) */}
      <link
        rel="alternate"
        hreflang="x-default"
        href={`${SITE_URL}${pathname}`}
      />

      {/* Open Graph tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DevBoards.io" />
      <meta property="og:title" content={head.title} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={LOCALE_MAP[currentLang]} />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="DevBoards.io - Find your ideal IT job"
      />
      {
        /* Alternate locales for Open Graph */
        SUPPORTED_LANGUAGES.filter((l) => l !== currentLang).map((lang) => (
          <meta
            key={lang}
            property="og:locale:alternate"
            content={LOCALE_MAP[lang]}
          />
        ))
      }

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={head.title} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      <meta
        name="twitter:image:alt"
        content="DevBoards.io - Find your ideal IT job"
      />

      {/* Iterate over DocumentHead meta tags */}
      {head.meta.map((m) => {
        // Also add Open Graph and Twitter equivalents for description
        if (m.name === "description") {
          return (
            <>
              <meta key={m.key} {...m} />
              <meta
                key={`og-${m.key}`}
                property="og:description"
                content={m.content}
              />
              <meta
                key={`tw-${m.key}`}
                name="twitter:description"
                content={m.content}
              />
            </>
          );
        }
        return <meta key={m.key} {...m} />;
      })}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          nonce={nonce}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: trustHtml(s.style || "") })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          nonce={nonce}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: trustScript(s.script || "") })}
        />
      ))}
    </>
  );
});
