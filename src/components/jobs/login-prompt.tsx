import { component$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

export const LoginPrompt = component$(() => {
  const t = useTranslate();

  return (
    <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
      <p class="text-xs text-gray-600 dark:text-gray-300 text-center">
        <a
          href="/login"
          class="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          {t("common.login")}
        </a>{" "}
        {t("common.or")}{" "}
        <a
          href="/register"
          class="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          {t("common.register")}
        </a>{" "}
        {t("auth.login_to_interact")}
      </p>
    </div>
  );
});
