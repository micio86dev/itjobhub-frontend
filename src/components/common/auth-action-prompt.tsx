import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useI18n } from "~/contexts/i18n";

export const AuthActionPrompt = component$(() => {
  const i18n = useI18n();
  const login = i18n.currentLanguage === "it" ? "Accedi" : "Login";
  const or = i18n.currentLanguage === "it" ? "o" : "or";
  const register = i18n.currentLanguage === "it" ? "Registrati" : "Register";
  const toApply = i18n.currentLanguage === "it" ? "per candidarti" : "to apply";

  return (
    <div class="bg-brand-neon/5 mt-3 p-3 border border-brand-neon/10 rounded-sm authActionPrompt">
      <p class="text-gray-700 dark:text-gray-300 text-xs text-center">
        <Link
          href="/login"
          class="font-bold text-green-800 dark:text-brand-neon hover:underline"
        >
          {login}
        </Link>{" "}
        {or}{" "}
        <Link
          href="/register"
          class="font-bold text-green-800 dark:text-brand-neon hover:underline"
        >
          {register}
        </Link>{" "}
        {toApply}
      </p>
    </div>
  );
});
