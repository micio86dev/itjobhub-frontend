import { component$, isDev, useStyles$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { ScrollButtons } from "./components/ui/scroll-buttons";

import globalStyles from "./global.css?inline";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */
  useStyles$(globalStyles);

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0d1117" />

        {/* Favicon and touch icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}

        {/* Initialize theme immediately to prevent flash */}
        <script
          dangerouslySetInnerHTML={`
            (function() {
              try {
                var theme = localStorage.getItem("theme");
                var supportDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches === true;
                if (theme === "dark" || (!theme && supportDarkMode)) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (e) {}
            })();
          `}
        />

        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
        <ScrollButtons />
        {!isDev && <ServiceWorkerRegister />}
      </body>
    </QwikCityProvider>
  );
});
