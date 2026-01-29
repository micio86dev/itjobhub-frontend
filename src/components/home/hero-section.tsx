import { component$, type Signal, useStylesScoped$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";
import styles from "./hero-section.css?inline";

interface HeroSectionProps {
  topSkills: Signal<{ skill: string; count: number }[]>;
}

export const HeroSection = component$<HeroSectionProps>(({ topSkills }) => {
  useStylesScoped$(styles);
  const t = useTranslate();

  return (
    <section class="hero-section">
      <div class="bg-overlay">
        <div class="bg-pattern"></div>
      </div>
      <div class="container">
        <h1 class="heading">
          <span class="heading-main">{t("home.title")}</span>
          <span class="heading-sub">{t("home.subtitle")}</span>
        </h1>
        <p class="description">{t("home.opportunities_desc")}</p>

        {/* Search Box */}
        <div class="search-container">
          <form action="/jobs" method="get" class="group search-form">
            <div class="search-glow"></div>
            <div class="search-input-wrapper">
              <span class="search-icon-wrapper">
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                name="q"
                placeholder={t("home.start_search")}
                class="search-input"
                data-testid="search-query"
              />
              <button type="submit" class="search-button">
                {t("home.search_button")}
              </button>
            </div>
          </form>
          <div class="popular-tags">
            <span class="popular-label">{t("home.popular")}</span>
            {topSkills.value.length > 0 ? (
              topSkills.value.slice(0, 6).map((s) => (
                <a
                  key={s.skill}
                  href={`/jobs?q=${encodeURIComponent(s.skill)}`}
                  class="tag-link"
                >
                  {s.skill}
                </a>
              ))
            ) : (
              <>
                <a href="/jobs?q=Frontend" class="tag-link">
                  Frontend
                </a>
                <a href="/jobs?q=Backend" class="tag-link">
                  Backend
                </a>
                <a href="/jobs?q=Fullstack" class="tag-link">
                  Fullstack
                </a>
              </>
            )}
            <a href="/jobs?remote=true" class="tag-link">
              {t("jobs.remote")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
