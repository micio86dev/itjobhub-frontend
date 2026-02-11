import { component$, isDev, useStyles$, useServerData } from "@builder.io/qwik";
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
        <link rel="preload" href="/grid.svg" as="image" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        {/* Initialize theme immediately to prevent flash - Using external script for CSP compliance */}
        <script nonce={nonce} src="/theme-loader.js" />
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
