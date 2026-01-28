import {
  component$,
  useStore,
  useVisibleTask$,
  $,
  useStyles$,
} from "@builder.io/qwik";
import styles from "./news-index.css?inline";
import {
  type DocumentHead,
  useLocation,
  routeLoader$,
} from "@builder.io/qwik-city";
import { useTranslate, type SupportedLanguage } from "../../contexts/i18n";
import { NewsList } from "../../components/news/news-list";
import type { ApiNews } from "~/types/models";
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll";
import { Spinner } from "../../components/ui/spinner";
import { request } from "~/utils/api";

// Import translation files
import it from "~/locales/it.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import de from "~/locales/de.json";
import fr from "~/locales/fr.json";

const translations = { it, en, es, de, fr };

export const useHeadMeta = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.news_title"] || "Tech News - IT Job Hub",
    description:
      t["meta.news_description"] ||
      "Latest news for developers, software engineers, and tech professionals.",
  };
});

const CATEGORIES = [
  { key: "All", i18nKey: "news.category.all" },
  { key: "AI", i18nKey: "news.category.ai" },
  { key: "DevOps", i18nKey: "news.category.devops" },
  { key: "Cybersecurity", i18nKey: "news.category.cybersecurity" },
  { key: "Development", i18nKey: "news.category.development" },
  { key: "Cloud", i18nKey: "news.category.cloud" },
  { key: "Data Science", i18nKey: "news.category.datascience" },
];

export default component$(() => {
  useStyles$(styles);
  const t = useTranslate();
  const loc = useLocation();

  const state = useStore({
    news: [] as ApiNews[],
    page: 1,
    isLoading: true,
    hasMore: true,
    selectedCategory: loc.url.searchParams.get("category") || "All",
    initialLoadDone: false,
  });

  const fetchNews = $(async (page: number, reset: boolean = false) => {
    try {
      if (reset) {
        state.isLoading = true;
        state.news = [];
      } else {
        // Infinite scroll loading state can be handled by the hook usually,
        // but here we track if we are fetching to prevent double fetches
        state.isLoading = true;
      }

      const categoryParam =
        state.selectedCategory !== "All"
          ? `&category=${state.selectedCategory}`
          : "";
      const endpoint = `${import.meta.env.PUBLIC_API_URL}/news?page=${page}&limit=12${categoryParam}`;

      const res = await request(endpoint);
      const data = await res.json();

      if (data.success) {
        if (reset) {
          state.news = data.data.news;
        } else {
          // Deduplicate based on ID just in case
          const existingIds = new Set(state.news.map((n) => n.id));
          const newItems = (data.data.news as ApiNews[]).filter(
            (n) => !existingIds.has(n.id),
          );
          state.news = [...state.news, ...newItems];
        }

        state.hasMore = data.data.pagination.page < data.data.pagination.pages;
        state.page = page;
      }
    } catch (err) {
      console.error("Failed to fetch news", err);
    } finally {
      state.isLoading = false;
      state.initialLoadDone = true;
    }
  });

  // Initial load
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => state.selectedCategory);
    fetchNews(1, true);
  });

  const loadMore = $(async () => {
    if (!state.isLoading && state.hasMore) {
      await fetchNews(state.page + 1, false);
    }
  });

  const { ref: infiniteScrollRef } = useInfiniteScroll({
    loadMore$: loadMore,
    threshold: 0.1,
  });

  return (
    <div class="bg-slate-50 dark:bg-slate-950 pb-20 min-h-screen">
      {/* Header Banner */}
      <div class="relative bg-white dark:bg-slate-900 shadow-sm pt-16 pb-12">
        <div class="mx-auto px-4 text-center container">
          <div class="flex justify-center items-center bg-blue-100 dark:bg-blue-900/30 mx-auto mb-6 rounded-2xl w-16 h-16 text-blue-600 dark:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-8 h-8"
            >
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-8Z" />
            </svg>
          </div>
          <h1 class="mb-4 font-extrabold text-slate-900 dark:text-white text-4xl md:text-5xl tracking-tight">
            {t("news.list_title")}
          </h1>
          <p class="mx-auto max-w-2xl text-slate-600 dark:text-slate-400 text-lg">
            {t("news.list_subtitle")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div class="news-filter-bar">
        <div class="news-filter-container">
          <div class="news-filter-scroll">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mr-2 w-4 h-4 text-slate-500"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick$={() => (state.selectedCategory = cat.key)}
                class={`category-btn ${
                  state.selectedCategory === cat.key
                    ? "category-btn-active"
                    : "category-btn-inactive"
                }`}
              >
                {t(cat.i18nKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div class="mx-auto px-4 py-8 container">
        <NewsList
          news={state.news}
          isLoading={state.isLoading && state.page === 1}
        />

        {/* Infinite Scroll Trigger */}
        {state.hasMore && (
          <div ref={infiniteScrollRef} class="flex justify-center py-12">
            {state.isLoading && state.page > 1 && <Spinner size="lg" />}
          </div>
        )}

        {!state.hasMore && state.news.length > 0 && (
          <p class="py-8 text-slate-400 text-sm text-center">
            {t("news.end_of_results")}
          </p>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const meta = resolveValue(useHeadMeta);
  return {
    title: meta.title,
    meta: [
      {
        name: "description",
        content: meta.description,
      },
      {
        property: "og:title",
        content: meta.title,
      },
      {
        property: "og:description",
        content: meta.description,
      },
    ],
  };
};
