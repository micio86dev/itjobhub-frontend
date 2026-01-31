import { component$ } from "@builder.io/qwik";
import { NewsCard } from "./news-card";
import type { ApiNews } from "~/types/models";
import { useTranslate } from "~/contexts/i18n";

interface NewsListProps {
  news: ApiNews[];
  isLoading?: boolean;
}

export const NewsList = component$<NewsListProps>(({ news, isLoading }) => {
  const t = useTranslate();

  if (isLoading) {
    return (
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} class="bg-gray-100 rounded-lg h-96 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div class="py-16 text-center">
        <div class="inline-flex justify-center items-center bg-gray-100 mb-4 rounded-full w-16 h-16">
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            ></path>
          </svg>
        </div>
        <h3 class="font-medium text-gray-900 text-lg">{t("news.no_news")}</h3>
        <p class="mt-1 text-gray-500">{t("news.no_news_desc")}</p>
      </div>
    );
  }

  return (
    <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
});
