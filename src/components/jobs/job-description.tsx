import { component$, useStylesScoped$ } from "@builder.io/qwik";
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
      if (typeof window === "undefined") return raw;

      let sanitizer: any = DOMPurify;
      if (typeof sanitizer.sanitize !== "function" && typeof sanitizer === "function") {
        sanitizer = sanitizer(window);
      }

      return sanitizer.sanitize ? sanitizer.sanitize(raw) : raw;
    })();

    return (
      <div class="descriptionSection">
        <div class="prose prose-indigo max-w-none dark:prose-invert">
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
