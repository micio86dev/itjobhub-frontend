import {
  component$,
  isDev,
  useStyles$,
  useServerData,
  useVisibleTask$,
} from "@builder.io/qwik";
import { trustScript } from "./utils/trusted-types";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { ScrollButtons } from "./components/ui/scroll-buttons";

import globalStyles from "./global.css?inline";

export default component$(() => {
  const nonce = useServerData<string | undefined>("nonce");

  useStyles$(globalStyles);

  // ── Microsoft Clarity ─────────────────────────────────────────────────
  // Injected client-side only (cookieless mode — no GDPR consent required).
  // Uses devboards-policy for Trusted Types compliance.
  useVisibleTask$(
    () => {
      const clarityId = import.meta.env.VITE_CLARITY_ID;
      if (!clarityId) return;

      type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };
      type WindowWithClarity = Window & {
        clarity?: ClarityFn;
        trustedTypes?: {
          createPolicy: (
            name: string,
            rules: Record<string, (s: string) => string>,
          ) => { createScriptURL: (s: string) => string };
        };
      };
      const w = window as WindowWithClarity;

      // Bootstrap the Clarity queue before the script loads
      w.clarity =
        w.clarity ||
        function (...args: unknown[]) {
          (w.clarity!.q = w.clarity!.q || []).push(args);
        };

      // Build script element
      const script = document.createElement("script");
      script.async = true;
      const src = `https://www.clarity.ms/tag/${clarityId}`;

      // Trusted Types: use devboards-policy (allow-duplicates lets us re-use it)
      if (
        typeof w.trustedTypes !== "undefined" &&
        typeof w.trustedTypes?.createPolicy === "function"
      ) {
        try {
          const policy = w.trustedTypes.createPolicy("devboards-policy", {
            createScriptURL: (s: string) => s,
          });
          script.src = policy.createScriptURL(src);
        } catch {
          script.src = src;
        }
      } else {
        script.src = src;
      }

      // Enable 100% session sampling once Clarity is ready
      script.onload = () => {
        w.clarity?.("set", "samplerate", 100);
      };

      const firstScript = document.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(script, firstScript);
    },
    { strategy: "document-idle" },
  );
  // ──────────────────────────────────────────────────────────────────────

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0d1117" />

        {/* Trusted Types Bootstrapper - MUST BE FIRST */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={trustScript(`
            if (window.trustedTypes) {
              const existingPolicies = (typeof window.trustedTypes.getPolicyNames === 'function') 
                ? window.trustedTypes.getPolicyNames() 
                : [];
              
              // Create policies safely
              try {
                if (!existingPolicies.includes('default')) {
                  window.trustedTypes.createPolicy('default', {
                    createHTML: (s) => s,
                    createScript: (s) => s,
                    createScriptURL: (s) => s
                  });
                }
                if (!existingPolicies.includes('devboards-policy')) {
                  window.trustedTypes.createPolicy('devboards-policy', {
                    createHTML: (s) => s,
                    createScript: (s) => s,
                    createScriptURL: (s) => s
                  });
                }
                if (!existingPolicies.includes('dompurify')) {
                  window.trustedTypes.createPolicy('dompurify', {
                    createHTML: (s) => s
                  });
                }
              } catch (e) {
                console.warn('TrustedTypes bootstrap failed', e);
              }
            }
          `)}
        />

        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/Inter-Latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/JetBrainsMono-Latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/FiraCode-Latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/grid.svg" as="image" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        {/* Initialize theme immediately to prevent flash - Inlined for performance */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={trustScript(`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                if (theme === 'dark' || (!theme && supportDarkMode)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `)}
        />
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
        <ScrollButtons />
        {!isDev && <ServiceWorkerRegister nonce={nonce} />}
      </body>
    </QwikCityProvider>
  );
});
