import { component$, $ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useTranslate, useI18n } from "../../contexts/i18n";

interface NewsTranslation {
  language: string;
  title: string;
  summary?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  image_url?: string;
  category?: string;
  language?: string;
  translations?: NewsTranslation[];
  published_at?: string;
  likes: number;
  comments_count: number;
  views_count: number;
  clicks_count: number;
}

interface NewsCardProps {
  news: NewsItem;
}

export const NewsCard = component$<NewsCardProps>(({ news }) => {
  const t = useTranslate();
  const { currentLanguage } = useI18n();

  // Find translation or fallback to original
  const translation = news.translations?.find(
    (tr) => tr.language === currentLanguage,
  );

  const displayTitle = translation?.title || news.title;
  const displaySummary = translation?.summary || news.summary;

  const formatDate = $((dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(currentLanguage, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  return (
    <div
      data-testid="news-card"
      class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      {/* Image Section */}
      {news.image_url && (
        <div class="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={news.image_url}
            alt={displayTitle}
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            width="800"
            height="400"
          />
          {news.category && (
            <div class="absolute right-3 top-3 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {news.category}
            </div>
          )}
        </div>
      )}

      <div class="flex flex-1 flex-col p-5">
        {/* Meta Header */}
        <div class="mb-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-3 w-3"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>{formatDate(news.published_at)}</span>
          </div>
        </div>

        {/* Title & Summary */}
        <Link
          href={`/news/${news.slug}`}
          class="mb-2 block"
          data-testid="news-card-link"
        >
          <h3 class="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {displayTitle}
          </h3>
        </Link>

        <p class="mb-4 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-300">
          {displaySummary}
        </p>

        {/* Footer Stats */}
        <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5 transition-colors hover:text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3.5 w-3.5"
              >
                <path d="M7 10v12" />
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
              </svg>
              <span>{news.likes}</span>
            </div>
            <div class="flex items-center gap-1.5 transition-colors hover:text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3.5 w-3.5"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              <span>{news.comments_count}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 opacity-60">
            <div class="flex items-center gap-1" title={t("views")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3 w-3"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{news.views_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
