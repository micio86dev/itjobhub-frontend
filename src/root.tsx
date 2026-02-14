import { component$, isDev, useStyles$, useServerData } from "@builder.io/qwik";
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
              
              if (!existingPolicies.includes('default')) {
                try {
                  window.trustedTypes.createPolicy('default', {
                    createHTML: (s) => s,
                    createScript: (s) => s,
                    createScriptURL: (s) => s
                  });
                  window.trustedTypes.createPolicy('devboards-policy', {
                    createHTML: (s) => s,
                    createScript: (s) => s,
                    createScriptURL: (s) => s
                  });
                  window.trustedTypes.createPolicy('dompurify', {
                    createHTML: (s) => s
                  });
                } catch (e) {
                  console.warn('TrustedTypes bootstrap failed', e);
                }
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
