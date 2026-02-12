import DOMPurify from "dompurify";
import { isBrowser } from "@builder.io/qwik/build";

export const sanitizeHtml = (html: string) => {
  if (!isBrowser) return html;

  const sanitizer =
    typeof DOMPurify === "function"
      ? (DOMPurify as unknown as () => typeof DOMPurify)()
      : DOMPurify;

  return sanitizer.sanitize(html, {
    RETURN_TRUSTED_TYPE: true,
  }) as unknown as string;
};
