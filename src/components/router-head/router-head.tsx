import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";
import type { SupportedLanguage } from "~/contexts/i18n";

// Base URL for production - update this when deploying
const SITE_URL = import.meta.env.PUBLIC_SITE_URL;

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

  // Default to Italian for SEO - the actual user language is handled client-side
  // via the I18nProvider in layout.tsx
  const currentLang: SupportedLanguage = "it";
  const currentUrl = loc.url.href;
  const pathname = loc.url.pathname;

  // Build canonical URL (without language prefix for now, as routing is cookie-based)
  const canonicalUrl = `${SITE_URL}${pathname}`;

  return (
    <>
      <title>{head.title}</title>

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Language attribute for the document */}
      <meta httpEquiv="content-language" content={currentLang} />

      {/* hreflang tags for all supported languages */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hreflang={lang}
          href={`${SITE_URL}${pathname}`}
        />
      ))}
      {/* x-default hreflang for language selector / default */}
      <link
        rel="alternate"
        hreflang="x-default"
        href={`${SITE_URL}${pathname}`}
      />

      {/* Open Graph tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ITJobHub" />
      <meta property="og:title" content={head.title} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={LOCALE_MAP[currentLang]} />
      {SUPPORTED_LANGUAGES.filter((l) => l !== currentLang).map((lang) => (
        <meta
          key={lang}
          property="og:locale:alternate"
          content={LOCALE_MAP[lang]}
        />
      ))}

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={head.title} />

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
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
