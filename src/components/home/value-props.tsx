import { component$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

export const ValueProps = component$(() => {
  const t = useTranslate();

  return (
    <section class="py-16 bg-gray-50 dark:bg-black/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("home.why_us_title")}
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div class="text-center group p-6 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl">
            <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              💼
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {t("home.opportunities_title")}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("home.opportunities_desc")}
            </p>
          </div>
          <div class="text-center group p-6 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl">
            <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-pink-100 text-pink-600 mb-6 group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {t("home.growth_title")}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("home.growth_desc")}
            </p>
          </div>
          <div class="text-center group p-6 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl">
            <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              🌐
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {t("home.remote_title")}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("home.remote_desc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
