import {
  component$,
  useStore,
  useTask$,
  $,
  useStyles$,
} from "@builder.io/qwik";
import styles from "./news-index.css?inline";
import {
  type DocumentHead,
  useLocation,
  routeLoader$,
  useNavigate,
} from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
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

export const useNewsListHeadLoader = routeLoader$(({ cookie }) => {
  const savedLang =
    (cookie.get("preferred-language")?.value as SupportedLanguage) || "it";
  const lang = savedLang in translations ? savedLang : "it";
  const t = translations[lang];
  return {
    title: t["meta.news_title"] || "Tech News - DevBoards.io",
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

export const useNewsListLoader = routeLoader$(async ({ url, env, cookie }) => {
  const category = url.searchParams.get("category") || "All";
  const page = 1;
  const limit = 12;
  const API_URL = env.get("PUBLIC_API_URL") || "http://127.0.0.1:3001";
  const token = cookie.get("auth_token")?.value;

  const categoryParam = category !== "All" ? `&category=${category}` : "";
  const endpoint = `${API_URL}/news?page=${page}&limit=${limit}${categoryParam}`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    return {
      success: true,
      news: data.success ? (data.data.news as ApiNews[]) : [],
      pagination: data.success ? data.data.pagination : { page: 1, pages: 1 },
      category,
    };
  } catch (err) {
    console.error("Failed to fetch news", err);
    return {
      success: false,
      news: [],
      pagination: { page: 1, pages: 1 },
      category,
    };
  }
});

export default component$(() => {
  useStyles$(styles);
  const t = useTranslate();
  const loc = useLocation();
  const nav = useNavigate();
  const newsLoader = useNewsListLoader();
  const auth = useAuth();

  const state = useStore({
    news: [] as ApiNews[],
    page: 1,
    isLoading: false,
    hasMore: true,
    // Initialize category from loader to ensure consistency
    selectedCategory: newsLoader.value.category,
  });

  // Sync state with loader data (SSR + Client Navigation)
  useTask$(({ track }) => {
    const data = track(() => newsLoader.value);

    // Always reset news when loader data changes (initial load or category change)
    state.news = data.news;
    state.page = data.pagination.page;
    state.hasMore = data.pagination.page < data.pagination.pages;
    state.selectedCategory = data.category;
    state.isLoading = false;
  });

  // Client-side fetch only for Load More
  const fetchMoreNews = $(async (page: number) => {
    state.isLoading = true;
    try {
      const categoryParam =
        state.selectedCategory !== "All"
          ? `&category=${state.selectedCategory}`
          : "";
      const endpoint = `${import.meta.env.PUBLIC_API_URL}/news?page=${page}&limit=12${categoryParam}`;

      const res = await request(endpoint, {
        cache: "no-store",
        headers: {
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
      });
      const data = await res.json();

      if (data.success) {
        // Deduplicate based on ID
        const existingIds = new Set(state.news.map((n) => n.id));
        const newItems = (data.data.news as ApiNews[]).filter(
          (n) => !existingIds.has(n.id),
        );
        state.news = [...state.news, ...newItems];

        state.hasMore = data.data.pagination.page < data.data.pagination.pages;
        state.page = page;
      }
    } catch (err) {
      console.error("Failed to fetch more news", err);
    } finally {
      state.isLoading = false;
    }
  });

  const handleCategoryChange = $((key: string) => {
    // Navigate to update URL and trigger loader
    const url = new URL(loc.url);
    if (key === "All") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", key);
    }
    nav(url.pathname + url.search);
  });

  const loadMore = $(async () => {
    if (!state.isLoading && state.hasMore) {
      await fetchMoreNews(state.page + 1);
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
          <div class="flex justify-center items-center bg-brand-neon/10 dark:bg-brand-neon/20 mx-auto mb-6 rounded-2xl w-16 h-16 text-brand-neon">
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
                onClick$={() => handleCategoryChange(cat.key)}
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
          isLoading={false} // Loading handled by SSR or infinite scroll spinner
        />

        {/* Infinite Scroll Trigger */}
        {state.hasMore && (
          <div ref={infiniteScrollRef} class="flex justify-center py-12">
            {state.isLoading && <Spinner size="lg" />}
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
  const meta = resolveValue(useNewsListHeadLoader);
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
