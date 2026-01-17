import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useTranslate } from "~/contexts/i18n";
import styles from "./not-found.css?inline";

interface NotFoundProps {
  title?: string;
  description?: string;
  icon?: string;
  backLink?: string;
  backLinkText?: string;
}

export const NotFound = component$<NotFoundProps>(
  ({ title, description, icon = "🔍", backLink = "/", backLinkText }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    return (
      <div class="not-found-wrapper">
        <div class="icon">{icon}</div>
        <h2 class="title">{title || t("common.not_found")}</h2>
        <p class="description">
          {description || t("common.not_found_description")}
        </p>
        <Link href={backLink} class="back-link">
          {backLinkText || t("common.go_back")}
        </Link>
      </div>
    );
  },
);
