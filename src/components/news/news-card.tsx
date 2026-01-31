import { component$, $, useStylesScoped$, useSignal } from "@builder.io/qwik";
import styles from "./news-card.css?inline";
import { Link } from "@builder.io/qwik-city";
import type { ApiNews } from "~/types/models";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { request } from "~/utils/api";
import { ReactionButtons } from "~/components/ui/reaction-buttons";

interface NewsCardProps {
  news: ApiNews;
}

export const NewsCard = component$<NewsCardProps>((props) => {
  const { news: initialNews } = props;
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
    const currentNews = newsSignal.value;

    const currentlyLiked = currentNews.user_reaction === "LIKE";
    const currentlyDisliked = currentNews.user_reaction === "DISLIKE";

    // Optimistic Update
    if (currentlyLiked) {
      currentNews.likes = Math.max(0, currentNews.likes - 1);
      currentNews.user_reaction = null;
    } else {
      currentNews.likes++;
      currentNews.user_reaction = "LIKE";
      if (currentlyDisliked) {
        currentNews.dislikes = Math.max(0, currentNews.dislikes - 1);
      }
    }
    // Force update
    newsSignal.value = { ...currentNews };

    try {
      const method = currentlyLiked ? "DELETE" : "POST";
      const url =
        method === "DELETE"
          ? `/likes?newsId=${currentNews.id}&type=LIKE`
          : `/likes`;
      const body =
        method === "POST"
          ? JSON.stringify({ newsId: currentNews.id, type: "LIKE" })
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
    const currentNews = newsSignal.value;

    const currentlyLiked = currentNews.user_reaction === "LIKE";
    const currentlyDisliked = currentNews.user_reaction === "DISLIKE";

    // Optimistic Update
    if (currentlyDisliked) {
      currentNews.dislikes = Math.max(0, currentNews.dislikes - 1);
      currentNews.user_reaction = null;
    } else {
      currentNews.dislikes++;
      currentNews.user_reaction = "DISLIKE";
      if (currentlyLiked) {
        currentNews.likes = Math.max(0, currentNews.likes - 1);
      }
    }
    newsSignal.value = { ...currentNews };

    try {
      const method = currentlyDisliked ? "DELETE" : "POST";
      const url =
        method === "DELETE"
          ? `/likes?newsId=${currentNews.id}&type=DISLIKE`
          : `/likes`;
      const body =
        method === "POST"
          ? JSON.stringify({ newsId: currentNews.id, type: "DISLIKE" })
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

  // Category translation
  const categoryKey = `news.category.${news.category?.toLowerCase().replace(/\s+/g, "")}`;
  const displayCategory =
    news.category && t(categoryKey) !== categoryKey
      ? t(categoryKey)
      : news.category;

  return (
    <div class="news-card" data-testid="news-card">
      <div class="header">
        <div class="header-content">
          <div class="title-container">
            {displayCategory && (
              <span class="mb-2 category-badge">{displayCategory}</span>
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
              <span>{t("news.source")}</span>
            </>
          )}
        </div>
      </div>

      <div class="summary">{displaySummary}</div>

      <div class="footer-actions">
        <ReactionButtons
          likes={news.likes}
          dislikes={news.dislikes}
          userReaction={news.user_reaction}
          onLike$={handleLike}
          onDislike$={handleDislike}
          isAuthenticated={auth.isAuthenticated}
          likeTitle={t("news.like")}
          dislikeTitle={t("news.dislike")}
        >
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
        </ReactionButtons>

        <a href={`/news/${news.slug}`} class="btn-secondary read-more-btn">
          {t("common.read_more")}
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
