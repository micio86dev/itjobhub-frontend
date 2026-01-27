import { component$, useStore, useVisibleTask$, $ } from "@builder.io/qwik";
import { type DocumentHead, useLocation } from "@builder.io/qwik-city";
import { useTranslate } from "../../contexts/i18n";
import { NewsList } from "../../components/news/news-list";
import type { ApiNews } from "~/types/models";
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll";
import { Spinner } from "../../components/ui/spinner";

export const head: DocumentHead = {
  title: "IT Job Hub - Tech News",
  meta: [
    {
      name: "description",
      content:
        "Latest news for developers, software engineers, and tech professionals.",
    },
  ],
};

const CATEGORIES = [
  { key: "All", i18nKey: "news.category.all" },
  { key: "AI", i18nKey: "news.category.ai" },
  { key: "DevOps", i18nKey: "news.category.devops" },
  { key: "Cybersecurity", i18nKey: "news.category.cybersecurity" },
  { key: "Development", i18nKey: "news.category.development" },
  { key: "Cloud", i18nKey: "news.category.cloud" },
  { key: "Data Science", i18nKey: "news.category.datascience" },
];

import { request } from "~/utils/api";

export default component$(() => {
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
    threshold: 100,
  });

  return (
    <div class="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      {/* Header Banner */}
      <div class="relative bg-white pb-12 pt-16 shadow-sm dark:bg-slate-900">
        <div class="container mx-auto px-4 text-center">
          <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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
              class="h-8 w-8"
            >
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-8Z" />
            </svg>
          </div>
          <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            {t("Tech News & Insights")}
          </h1>
          <p class="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            {t(
              "Stay updated with the latest trends in software development, AI, and cloud infrastructure.",
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div class="sticky top-16 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div class="container mx-auto">
          <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
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
              class="mr-2 h-4 w-4 text-slate-500"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick$={() => (state.selectedCategory = cat.key)}
                class={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  state.selectedCategory === cat.key
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {t(cat.i18nKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8">
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
          <p class="text-sm text-slate-400 text-center py-8">
            {t("You've reached the end")}
          </p>
        )}
      </div>
    </div>
  );
});
