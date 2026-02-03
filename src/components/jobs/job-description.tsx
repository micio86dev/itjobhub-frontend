import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { isBrowser } from "@builder.io/qwik/build";
import styles from "./job-description.css?inline";
import { useTranslate } from "~/contexts/i18n";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface JobDescriptionProps {
  description: string;
}

export const JobDescription = component$<JobDescriptionProps>(
  ({ description }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    const htmlContent = (() => {
      const raw = marked.parse(description, { async: false }) as string;
      if (!isBrowser) return raw;

      const sanitizer =
        typeof DOMPurify === "function"
          ? (DOMPurify as unknown as () => typeof DOMPurify)()
          : DOMPurify;

      return sanitizer.sanitize(raw);
    })();

    return (
      <div class="descriptionSection">
        <div class="dark:prose-invert max-w-none prose prose-slate">
          <h3 class="descriptionTitle">
            <span class="descriptionBar"></span>
            {t("job.description_title")}
          </h3>
          <div
            class="descriptionContent"
            dangerouslySetInnerHTML={htmlContent}
          ></div>
        </div>
      </div>
    );
  },
);
