import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useTranslate } from "~/contexts/i18n";

interface AuthActionPromptProps {
  actionText: string;
  containerClass?: string;
}

export const AuthActionPrompt = component$<AuthActionPromptProps>(
  ({ actionText, containerClass = "" }) => {
    const t = useTranslate();

    return (
      <div
        class={`bg-brand-neon/5 mt-3 p-3 border border-brand-neon/10 rounded-sm ${containerClass}`}
      >
        <p class="text-gray-700 dark:text-gray-300 text-xs text-center">
          <Link
            href="/login"
            class="font-bold text-green-800 dark:text-brand-neon hover:underline"
          >
            {t("common.login")}
          </Link>{" "}
          {t("common.or").toLowerCase()}{" "}
          <Link
            href="/register"
            class="font-bold text-green-800 dark:text-brand-neon hover:underline"
          >
            {t("common.register")}
          </Link>{" "}
          {actionText}
        </p>
      </div>
    );
  },
);
