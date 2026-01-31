import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { useTranslate } from "~/contexts/i18n";

export default component$(() => {
  const t = useTranslate();

  return (
    <div class="mx-auto px-4 py-8 max-w-4xl container">
      <h1 class="mb-2 font-bold dark:text-white text-3xl">
        {t("privacy.title")}
      </h1>
      <p class="mb-8 text-gray-600 dark:text-gray-400">
        {t("privacy.last_updated")}
      </p>

      <div class="space-y-8 text-gray-800 dark:text-gray-200 leading-relaxed">
        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.intro_title")}
          </h2>
          <p>{t("privacy.intro_text")}</p>
        </section>

        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.collection_title")}
          </h2>
          <p>{t("privacy.collection_text")}</p>
        </section>

        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.usage_title")}
          </h2>
          <p>{t("privacy.usage_text")}</p>
        </section>

        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.sharing_title")}
          </h2>
          <p>{t("privacy.sharing_text")}</p>
        </section>

        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.security_title")}
          </h2>
          <p>{t("privacy.security_text")}</p>
        </section>

        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.rights_title")}
          </h2>
          <p>{t("privacy.rights_text")}</p>
        </section>

        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.cookies_title")}
          </h2>
          <p>{t("privacy.cookies_text")}</p>
        </section>

        <section>
          <h2 class="mb-4 font-bold text-brand-neon text-2xl tracking-tight">
            {t("privacy.contact_title")}
          </h2>
          <p>{t("privacy.contact_text")}</p>
        </section>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Privacy Policy - DevBoards.io",
  meta: [
    {
      name: "description",
      content: "Privacy Policy for DevBoards.io",
    },
  ],
};
