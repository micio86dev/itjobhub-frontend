import { component$, type Signal, useStylesScoped$ } from "@builder.io/qwik";
import { useTranslate, interpolate } from "~/contexts/i18n";
import styles from "./stats-section.css?inline";

interface StatsSectionProps {
  topSkills: Signal<{ skill: string; count: number }[]>;
}

export const StatsSection = component$<StatsSectionProps>(({ topSkills }) => {
  useStylesScoped$(styles);
  const t = useTranslate();

  return (
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value stat-value-indigo">1,200+</div>
            <div class="stat-label">{t("home.active_jobs_stat")}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value stat-value-pink">350+</div>
            <div class="stat-label">{t("home.companies_stat")}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value stat-value-purple">15k+</div>
            <div class="stat-label">{t("home.developers_stat")}</div>
          </div>
        </div>

        {/* Top Skills Chart */}
        {topSkills.value.length > 0 && (
          <div class="chart-card">
            <h3 class="chart-title">🔥 {t("home.top_skills_title")}</h3>
            <div class="chart-grid">
              {topSkills.value.slice(0, 10).map((skill, index) => (
                <div key={skill.skill} class="skill-item group">
                  <div class="skill-header">
                    <span class="skill-name-wrapper">
                      <span class="skill-rank-badge">{index + 1}</span>
                      {skill.skill}
                    </span>
                    <span class="skill-count">
                      {interpolate(t("home.jobs_count"), {
                        count: skill.count,
                      })}
                    </span>
                  </div>
                  <div class="bar-bg">
                    <div
                      class="bar-fill"
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
