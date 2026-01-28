import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";
import styles from "./value-props.css?inline";

export const ValueProps = component$(() => {
  useStylesScoped$(styles);
  const t = useTranslate();

  return (
    <section class="value-props-section">
      <div class="container">
        <div class="header">
          <h2 class="title">{t("home.why_us_title")}</h2>
        </div>
        <div class="gridContainer">
          <div class="group card">
            <div class="icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="card-title">{t("home.opportunities_title")}</h3>
            <p class="card-desc">{t("home.opportunities_desc")}</p>
          </div>
          <div class="card">
            <div class="icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 class="card-title">{t("home.growth_title")}</h3>
            <p class="card-desc">{t("home.growth_desc")}</p>
          </div>
          <div class="card">
            <div class="icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 class="card-title">{t("home.remote_title")}</h3>
            <p class="card-desc">{t("home.remote_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
});
