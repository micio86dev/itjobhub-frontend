import { component$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

export const LoginPrompt = component$(() => {
  const t = useTranslate();

  return (
    <div class="bg-brand-neon/5 mt-3 p-3 border border-brand-neon/10 rounded-sm">
      <p class="text-gray-700 dark:text-gray-300 text-xs text-center">
        <a href="/login" class="font-bold text-brand-neon hover:underline">
          {t("common.login")}
        </a>{" "}
        {t("common.or")}{" "}
        <a href="/register" class="font-bold text-brand-neon hover:underline">
          {t("common.register")}
        </a>{" "}
        {t("auth.login_to_interact")}
      </p>
    </div>
  );
});
