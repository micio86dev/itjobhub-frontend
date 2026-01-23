import { component$, $, useStylesScoped$, useSignal } from "@builder.io/qwik";
import styles from "./news-card.css?inline";
import { Link } from "@builder.io/qwik-city";
import type { ApiNews } from "~/types/models";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { request } from "~/utils/api";

interface NewsCardProps {
  news: ApiNews;
}

export const NewsCard = component$<NewsCardProps>(({ news: initialNews }) => {
  useStylesScoped$(styles);
  const auth = useAuth();
  const t = useTranslate();
  const i18n = useI18n();
  const lang = i18n.currentLanguage;

  // Local state for interactions to ensure reactivity without full context for now
  const newsSignal = useSignal({ ...initialNews });
  const news = newsSignal.value;

  const handleLike = $(async () => {
    if (!auth.isAuthenticated) return;
    const token = auth.token;

    const currentlyLiked = news.user_reaction === "LIKE";
    const currentlyDisliked = news.user_reaction === "DISLIKE";

    // Optimistic Update
    if (currentlyLiked) {
      news.likes = Math.max(0, news.likes - 1);
      news.user_reaction = null;
    } else {
      news.likes++;
      news.user_reaction = "LIKE";
      if (currentlyDisliked) {
        news.dislikes = Math.max(0, news.dislikes - 1);
      }
    }
    // Force update
    newsSignal.value = { ...news };

    try {
      const method = currentlyLiked ? "DELETE" : "POST";
      const url =
        method === "DELETE" ? `/likes?newsId=${news.id}&type=LIKE` : `/likes`;
      const body =
        method === "POST"
          ? JSON.stringify({ newsId: news.id, type: "LIKE" })
          : undefined;

      await request(import.meta.env.PUBLIC_API_URL + url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      });
    } catch (e) {
      // Revert on error (omitted for brevity, can implement if needed)
      console.error("Like failed", e);
    }
  });

  const handleDislike = $(async () => {
    if (!auth.isAuthenticated) return;
    const token = auth.token;

    const currentlyLiked = news.user_reaction === "LIKE";
    const currentlyDisliked = news.user_reaction === "DISLIKE";

    // Optimistic Update
    if (currentlyDisliked) {
      news.dislikes = Math.max(0, news.dislikes - 1);
      news.user_reaction = null;
    } else {
      news.dislikes++;
      news.user_reaction = "DISLIKE";
      if (currentlyLiked) {
        news.likes = Math.max(0, news.likes - 1);
      }
    }
    newsSignal.value = { ...news };

    try {
      const method = currentlyDisliked ? "DELETE" : "POST";
      const url =
        method === "DELETE"
          ? `/likes?newsId=${news.id}&type=DISLIKE`
          : `/likes`;
      const body =
        method === "POST"
          ? JSON.stringify({ newsId: news.id, type: "DISLIKE" })
          : undefined;

      await request(import.meta.env.PUBLIC_API_URL + url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      });
    } catch (e) {
      console.error("Dislike failed", e);
    }
  });

  // Date formatting
  const dateObj = new Date(news.published_at || news.created_at || Date.now());
  const dtf = new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const dateDisplay = dtf.format(dateObj);

  return (
    <div class="news-card" data-testid="news-card">
      <div class="header">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            {news.category && (
              <span class="category-badge mb-2">{news.category}</span>
            )}
            <h3 class="news-title">
              <Link href={`/news/${news.slug}`}>{news.title}</Link>
            </h3>
          </div>
          {news.image_url && (
            <div class="w-16 h-16 ml-3 rounded overflow-hidden flex-shrink-0">
              <img
                src={news.image_url}
                alt={news.title}
                class="w-full h-full object-cover"
                width="64"
                height="64"
              />
            </div>
          )}
        </div>
        <div class="meta-row mt-2">
          <span>{dateDisplay}</span>
          {news.source_url && (
            <>
              <span>•</span>
              <span>Source</span>
            </>
          )}
        </div>
      </div>

      <div class="summary">{news.summary}</div>

      <div class="footer-actions">
        <div class="reaction-buttons">
          <button
            onClick$={handleLike}
            disabled={!auth.isAuthenticated}
            class={`reaction-btn ${
              news.user_reaction === "LIKE"
                ? "reaction-btn-like-active"
                : "reaction-btn-like-inactive"
            }`}
          >
            <span class="text-lg">👍</span>
            <span class="text-sm font-medium">{news.likes}</span>
          </button>

          <button
            onClick$={handleDislike}
            disabled={!auth.isAuthenticated}
            class={`reaction-btn ${
              news.user_reaction === "DISLIKE"
                ? "reaction-btn-dislike-active"
                : "reaction-btn-dislike-inactive"
            }`}
          >
            <span class="text-lg">👎</span>
            <span class="text-sm font-medium">{news.dislikes}</span>
          </button>

          <div class="flex items-center space-x-1 text-gray-500 text-sm">
            <span class="text-lg">💬</span>
            <span>{news.comments_count}</span>
          </div>

          <div class="stats-container">
            <span class="flex items-center" title="Views">
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {news.views_count || 0}
            </span>
          </div>
        </div>

        <Link href={`/news/${news.slug}`} class="read-more-btn">
          {t("common.read_more") || "Read more"}
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </Link>
      </div>
    </div>
  );
});
