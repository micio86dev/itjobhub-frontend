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

  // Localization
  let displayTitle = news.title;
  let displaySummary = news.summary;

  const translation = news.translations?.find((tr) => tr.language === lang);
  if (translation) {
    displayTitle = translation.title;
    displaySummary = translation.summary || displaySummary;
  }

  return (
    <div class="news-card" data-testid="news-card">
      <div class="header">
        <div class="header-content">
          <div class="title-container">
            {news.category && (
              <span class="mb-2 category-badge">{news.category}</span>
            )}
            <h3 class="news-title">
              <Link href={`/news/${news.slug}`}>{displayTitle}</Link>
            </h3>
          </div>
          {news.image_url && (
            <div class="image-wrapper">
              <img
                src={news.image_url}
                alt={displayTitle}
                class="card-image-small"
                width="64"
                height="64"
              />
            </div>
          )}
        </div>
        <div class="mt-2 meta-row">
          <span>{dateDisplay}</span>
          {news.source_url && (
            <>
              <span>•</span>
              <span>Source</span>
            </>
          )}
        </div>
      </div>

      <div class="summary">{displaySummary}</div>

      <div class="footer-actions">
        <div class="reaction-buttons">
          <button
            onClick$={handleLike}
            disabled={!auth.isAuthenticated}
            data-testid="like-button"
            class={`reaction-btn ${
              news.user_reaction === "LIKE"
                ? "reaction-btn-like-active"
                : "reaction-btn-like-inactive"
            }`}
          >
            <svg
              class="reaction-icon-svg"
              fill={news.user_reaction === "LIKE" ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 10h4.708C19.743 10 20.5 10.895 20.5 12c0 .403-.122.778-.331 1.091l-2.43 3.645C17.431 17.203 16.746 18 15.865 18H9v-8l1.32-3.958a2 2 0 011.897-1.368H13a2 2 0 012 2v3.326L14 10zM9 18H5a2 2 0 01-2-2v-4a2 2 0 012-2h4v8z"
              />
            </svg>
            <span class="font-medium text-sm" data-testid="like-count">
              {news.likes}
            </span>
          </button>

          <button
            onClick$={handleDislike}
            disabled={!auth.isAuthenticated}
            data-testid="dislike-button"
            class={`reaction-btn ${
              news.user_reaction === "DISLIKE"
                ? "reaction-btn-dislike-active"
                : "reaction-btn-dislike-inactive"
            }`}
          >
            <svg
              class="reaction-icon-svg"
              fill={news.user_reaction === "DISLIKE" ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14H5.292C4.257 14 3.5 13.105 3.5 12c0-.403.122-.778.331-1.091l2.43-3.645C6.569 6.797 7.254 6 8.135 6H15v8l-1.32 3.958a2 2 0 01-1.897 1.368H11a2 2 0 01-2-2v-3.326L10 14zM15 6h4a2 2 0 012 2v4a2 2 0 01-2 2h-4V6z"
              />
            </svg>
            <span class="font-medium text-sm" data-testid="dislike-count">
              {news.dislikes}
            </span>
          </button>

          <div class="comments-wrapper">
            <svg
              class="reaction-icon-svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span data-testid="comments-count">{news.comments_count}</span>
          </div>

          <div class="stats-container">
            <span class="flex items-center" title="Views">
              <svg
                class="mr-1 w-4 h-4"
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

        <a href={`/news/${news.slug}`} class="read-more-btn">
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
        </a>
      </div>
    </div>
  );
});
