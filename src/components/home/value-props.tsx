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
          <div class="card">
            <div class="icon-wrapper icon-wrapper-indigo">💼</div>
            <h3 class="card-title">{t("home.opportunities_title")}</h3>
            <p class="card-desc">{t("home.opportunities_desc")}</p>
          </div>
          <div class="card">
            <div class="icon-wrapper icon-wrapper-pink">🚀</div>
            <h3 class="card-title">{t("home.growth_title")}</h3>
            <p class="card-desc">{t("home.growth_desc")}</p>
          </div>
          <div class="card">
            <div class="icon-wrapper icon-wrapper-purple">🌐</div>
            <h3 class="card-title">{t("home.remote_title")}</h3>
            <p class="card-desc">{t("home.remote_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
});
