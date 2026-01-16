import { component$, type Signal } from "@builder.io/qwik";
import { useTranslate, interpolate } from "~/contexts/i18n";

interface StatsSectionProps {
  topSkills: Signal<{ skill: string; count: number }[]>;
}

export const StatsSection = component$<StatsSectionProps>(({ topSkills }) => {
  const t = useTranslate();

  return (
    <section class="bg-indigo-50 dark:bg-gray-800 py-12 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
          <div class="p-6">
            <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              1,200+
            </div>
            <div class="text-gray-600 dark:text-gray-300 font-medium">
              {t("home.active_jobs_stat")}
            </div>
          </div>
          <div class="p-6">
            <div class="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
              350+
            </div>
            <div class="text-gray-600 dark:text-gray-300 font-medium">
              {t("home.companies_stat")}
            </div>
          </div>
          <div class="p-6">
            <div class="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              15k+
            </div>
            <div class="text-gray-600 dark:text-gray-300 font-medium">
              {t("home.developers_stat")}
            </div>
          </div>
        </div>

        {/* Top Skills Chart */}
        {topSkills.value.length > 0 && (
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              🔥 {t("home.top_skills_title")}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topSkills.value.slice(0, 10).map((skill, index) => (
                <div key={skill.skill} class="relative group">
                  <div class="flex justify-between mb-2">
                    <span class="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      <span class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </span>
                      {skill.skill}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {interpolate(t("home.jobs_count"), {
                        count: skill.count,
                      })}
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out group-hover:from-indigo-400 group-hover:to-pink-400"
                      style={{
                        width: `${(skill.count / topSkills.value[0].count) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
