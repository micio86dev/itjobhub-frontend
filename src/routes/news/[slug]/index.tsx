import { component$, useStore, useTask$, isBrowser, $ } from "@builder.io/qwik";
import {
  Link,
  useNavigate,
  type DocumentHead,
  routeLoader$,
} from "@builder.io/qwik-city";
import { marked } from "marked";
import { request } from "~/utils/api";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { useAuth } from "~/contexts/auth";
import { NewsCommentsSection } from "~/components/news/comments-section";
import { ReactionButtons } from "~/components/ui/reaction-buttons";
import { DetailStats } from "~/components/ui/detail-stats";
import { AdminDeleteButton } from "~/components/ui/admin-delete-button";
import type { ApiNews } from "~/types/models";

export const useNewsLoader = routeLoader$(async ({ params, cookie }) => {
  const slug = params.slug;
  const token = cookie.get("auth_token")?.value;
  const lang = cookie.get("preferred-language")?.value || "it";
  const API_URL = process.env.PUBLIC_API_URL || "http://localhost:3001";

  if (!slug) return { news: null, lang };

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/news/${slug}`, {
      headers,
    });

    if (!res.ok) {
      return { news: null, lang };
    }

    const data = await res.json();
    if (data.success) {
      return { news: data.data as ApiNews, lang };
    }
    return { news: null, lang };
  } catch (e) {
    console.error("Error fetching news", e);
    return { news: null, lang };
  }
});

export default component$(() => {
  const auth = useAuth();
  const t = useTranslate();
  const i18n = useI18n();
  const nav = useNavigate();
  const lang = i18n.currentLanguage;
  const newsSignal = useNewsLoader();
  const deleteFailedMsg = t("news.delete_failed");

  const state = useStore({
    news: newsSignal.value.news,
    isDeleting: false,
  });

  // Sync state with loader data (in case of navigation)
  useTask$(({ track }) => {
    const loadedData = track(() => newsSignal.value);
    state.news = loadedData.news;
  });

  const handleLike = $(async () => {
    if (!auth.isAuthenticated || !state.news) return;
    const news = state.news;
    const currentReaction = news.user_reaction;
    const token = auth.token;

    // Optimistic Update
    if (currentReaction === "LIKE") {
      news.likes = Math.max(0, news.likes - 1);
      news.user_reaction = null;
      try {
        await request(
          `${import.meta.env.PUBLIC_API_URL}/likes?newsId=${news.id}&type=LIKE`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      news.likes++;
      news.user_reaction = "LIKE";
      if (currentReaction === "DISLIKE") {
        news.dislikes = Math.max(0, news.dislikes - 1);
      }
      try {
        await request(`${import.meta.env.PUBLIC_API_URL}/likes`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newsId: news.id, type: "LIKE" }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  });

  const handleDislike = $(async () => {
    if (!auth.isAuthenticated || !state.news) return;
    const news = state.news;
    const currentReaction = news.user_reaction;
    const token = auth.token;

    // Optimistic Update
    if (currentReaction === "DISLIKE") {
      news.dislikes = Math.max(0, news.dislikes - 1);
      news.user_reaction = null;
      try {
        await request(
          `${import.meta.env.PUBLIC_API_URL}/likes?newsId=${news.id}&type=DISLIKE`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      news.dislikes++;
      news.user_reaction = "DISLIKE";
      if (currentReaction === "LIKE") {
        news.likes = Math.max(0, news.likes - 1);
      }
      try {
        await request(`${import.meta.env.PUBLIC_API_URL}/likes`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newsId: news.id, type: "DISLIKE" }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  });

  const handleDelete = $(async () => {
    const token = auth.token;
    const newsId = state.news?.id;
    if (!newsId || !token) return;

    state.isDeleting = true;
    try {
      const res = await request(
        `${import.meta.env.PUBLIC_API_URL}/news/${newsId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        await nav("/news");
      } else {
        alert(deleteFailedMsg);
      }
    } catch (e) {
      console.error("Error deleting news", e);
      alert(deleteFailedMsg);
    } finally {
      state.isDeleting = false;
    }
  });

  // Track View
  useTask$(({ track }) => {
    const newsId = track(() => state.news?.id);
    if (newsId && isBrowser) {
      request(`${import.meta.env.PUBLIC_API_URL}/news/${newsId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "VIEW" }),
      }).catch(console.error);
    }
  });

  // Date formatter
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString(lang, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (!state.news) {
    return (
      <div class="bg-slate-50 dark:bg-slate-950 pt-24 pb-20 min-h-screen">
        <div class="mx-auto px-4 max-w-4xl container">
          <div class="py-20 text-center">
            <h2 class="font-bold text-gray-800 dark:text-gray-200 text-2xl">
              {t("news.not_found")}
            </h2>
            <Link
              href="/news"
              class="inline-block mt-4 text-blue-600 hover:underline"
            >
              {t("news.go_back")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const news = state.news;
  let displayTitle = news.title;
  let displayContent = news.content;

  const translation = news.translations?.find((tr) => tr.language === lang);
  if (translation) {
    displayTitle = translation.title;
    displayContent = translation.content || displayContent;
  }

  return (
    <div class="bg-slate-50 dark:bg-slate-950 pt-24 pb-20 min-h-screen">
      <div class="mx-auto px-4 max-w-4xl container">
        <Link
          href="/news"
          data-testid="back-link"
          class="group flex items-center gap-2 hover:bg-brand-neon/10 dark:hover:bg-brand-neon/5 mb-8 -ml-3 px-3 py-2 rounded-xl w-fit font-bold text-gray-600 hover:text-brand-neon dark:hover:text-brand-neon dark:text-white text-sm transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform group-hover:-translate-x-1.5 duration-300"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>{t("news.back")}</span>
        </Link>

        <article class="bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
          {/* Hero Image */}
          {news.image_url && (
            <div class="relative w-full h-64 md:h-96">
              <img
                src={news.image_url}
                alt={displayTitle}
                class="w-full h-full object-cover"
                width="1200"
                height="600"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="bottom-0 left-0 absolute p-6 md:p-8 text-white">
                {news.category && (
                  <span class="inline-block bg-brand-neon mb-3 px-3 py-1 rounded-full font-bold text-black text-xs uppercase tracking-wide">
                    {news.category}
                  </span>
                )}
                <h1 class="mb-2 font-bold text-3xl md:text-5xl leading-tight">
                  {displayTitle}
                </h1>
                <div class="flex items-center gap-4 text-gray-200 text-sm md:text-base">
                  <span>
                    {formatDate(news.published_at || news.created_at)}
                  </span>
                  {news.source_url && (
                    <a
                      href={news.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="hover:text-white decoration-dotted underline"
                    >
                      {t("news.source")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {!news.image_url && (
            <div class="p-8 border-gray-100 dark:border-gray-800 border-b">
              {news.category && (
                <span class="inline-block bg-brand-neon mb-3 px-3 py-1 rounded-full font-bold text-black text-xs uppercase tracking-wide">
                  {news.category}
                </span>
              )}
              <h1 class="mb-4 font-bold text-gray-900 dark:text-white text-3xl md:text-4xl">
                {displayTitle}
              </h1>
              <div class="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                <span>{formatDate(news.published_at || news.created_at)}</span>
                {news.source_url && (
                  <a
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:text-brand-neon decoration-dotted underline"
                  >
                    {t("news.source")}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div class="p-6 md:p-10">
            {/* Admin Actions */}
            <div class="flex justify-end mb-6">
              <div class="px-8 pb-8">
                {auth.user?.role === "admin" && (
                  <AdminDeleteButton
                    onDelete$={handleDelete}
                    confirmTitle={t("news.confirm_delete_title")}
                    confirmMessage={t("news.confirm_delete_msg")}
                    buttonText={t("news.delete_article")}
                    isDeleting={state.isDeleting}
                    testId="delete-article-btn"
                  />
                )}
              </div>
            </div>

            {displayContent && (
              <div
                class="dark:prose-invert max-w-none prose prose-lg"
                dangerouslySetInnerHTML={marked.parse(displayContent) as string}
              ></div>
            )}
          </div>

          {/* Interactions Footer */}
          <div class="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 border-gray-100 dark:border-gray-800 border-t">
            <div class="flex justify-between items-center mb-8">
              <ReactionButtons
                likes={news.likes}
                dislikes={news.dislikes}
                userReaction={news.user_reaction}
                onLike$={handleLike}
                onDislike$={handleDislike}
                isAuthenticated={auth.isAuthenticated}
                likeTitle={t("news.like")}
                dislikeTitle={t("news.dislike")}
              />
              <DetailStats
                viewsCount={news.views_count}
                clicksCount={news.clicks_count}
                viewsLabel={t("news.views")}
                clicksLabel={t("news.clicks")}
              />
            </div>

            <NewsCommentsSection newsId={news.id} />
          </div>
        </article>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const { news, lang } = resolveValue(useNewsLoader);

  if (!news) {
    return {
      title: "News Not Found - IT Job Hub",
    };
  }

  let title = news.title;
  let description =
    news.summary || (news.content ? news.content.substring(0, 160) : "");

  const translation = news.translations?.find((tr) => tr.language === lang);
  if (translation) {
    title = translation.title;
    description =
      translation.summary ||
      (translation.content
        ? translation.content.substring(0, 160)
        : description);
  }

  return {
    title: `${title} - IT Job Hub`,
    meta: [
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
      {
        property: "og:image",
        content: news.image_url || "",
      },
    ],
  };
};
