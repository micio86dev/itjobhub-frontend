import {
  component$,
  useStore,
  useTask$,
  isBrowser,
  useResource$,
  Resource,
  $,
} from "@builder.io/qwik";
import {
  useLocation,
  Link,
  useNavigate,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { marked } from "marked";
import { request } from "~/utils/api";
import { Modal } from "~/components/ui/modal";
import { Spinner } from "~/components/ui/spinner";
// import logger from "~/utils/logger";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { useAuth } from "~/contexts/auth";
import { NewsCommentsSection } from "~/components/news/comments-section";
import type { ApiNews } from "~/types/models";
// No specific styles file yet, simpler layout or inline tailwind
// import styles from "./index.css?inline";

export default component$(() => {
  // useStylesScoped$(styles);
  const loc = useLocation();
  const auth = useAuth();
  const t = useTranslate();
  const i18n = useI18n();
  const nav = useNavigate();
  const lang = i18n.currentLanguage;

  const state = useStore({
    news: null as ApiNews | null,
    showDeleteModal: false,
    isDeleting: false,
  });

  const newsResource = useResource$<ApiNews | null>(async ({ track }) => {
    const slug = track(() => loc.params.slug);
    track(() => auth.token); // Re-fetch on auth change for user_reaction

    if (!slug) return null;

    try {
      // Pass auth token if available to get user_reaction
      const headers: Record<string, string> = {};
      if (auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const res = await request(
        `${import.meta.env.PUBLIC_API_URL || "http://localhost:3001"}/news/${slug}`,
        {
          headers,
        },
      );

      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch news");
      }

      const data = await res.json();
      if (data.success) {
        state.news = data.data;
        return data.data;
      }
      return null;
    } catch (e) {
      console.error("Error fetching news", e);
      return null;
    }
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
      // API Call DELETE
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
      // API Call POST
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
    // Force re-render if needed (Qwik stores are reactive)
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
      // API Call DELETE
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
      // API Call POST
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
    if (!state.news || !auth.token) return;
    state.isDeleting = true;
    try {
      const res = await request(
        `${import.meta.env.PUBLIC_API_URL}/news/${state.news.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );

      if (res.ok) {
        await nav("/news");
      } else {
        alert("Failed to delete news");
      }
    } catch (e) {
      console.error("Error deleting news", e);
      alert("Error deleting news");
    } finally {
      state.isDeleting = false;
      state.showDeleteModal = false;
    }
  });

  const handleCloseDeleteModal = $(() => {
    state.showDeleteModal = false;
  });

  const handleOpenDeleteModal = $(() => {
    state.showDeleteModal = true;
  });

  // Track View
  useTask$(({ track }) => {
    const newsId = track(() => state.news?.id);
    if (newsId && isBrowser) {
      // Fire and forget tracking
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

        <Resource
          value={newsResource}
          onPending={() => (
            <div class="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}
          onRejected={() => (
            <div class="py-20 text-center">
              <h2 class="font-bold text-red-500 text-2xl">
                Error loading news
              </h2>
              <Link
                href="/news"
                class="inline-block mt-4 text-blue-600 hover:underline"
              >
                Go back
              </Link>
            </div>
          )}
          onResolved={(news) => {
            if (!news) {
              return (
                <div class="py-20 text-center">
                  <h2 class="font-bold text-gray-800 dark:text-gray-200 text-2xl">
                    News Not Found
                  </h2>
                  <Link
                    href="/news"
                    class="inline-block mt-4 text-blue-600 hover:underline"
                  >
                    Go back
                  </Link>
                </div>
              );
            }

            // Content translation logic could go here if "translations" array is used on frontend
            // But assume backend returns normalized object or we render 'content' directly.
            // The ApiNews model has `translations`. IF the backend `fetchJobById` logic does "deriveLang",
            // it might already pick the right one.
            // But for News, we implemented `getNewsBySlug` which returns the raw object.
            // We might want to find the translation here.

            let displayTitle = news.title;
            let displayContent = news.content;
            // let displaySummary = news.summary;

            const translation = news.translations?.find(
              (tr) => tr.language === lang,
            );
            if (translation) {
              displayTitle = translation.title;
              displayContent = translation.content || displayContent;
              // displaySummary = translation.summary || displaySummary;
            }

            return (
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
                            Source
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
                      <span>
                        {formatDate(news.published_at || news.created_at)}
                      </span>
                      {news.source_url && (
                        <a
                          href={news.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="hover:text-brand-neon decoration-dotted underline"
                        >
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div class="p-6 md:p-10">
                  {/* Admin Actions */}
                  {auth.user?.role === "admin" && (
                    <div class="flex justify-end mb-6">
                      <button
                        onClick$={handleOpenDeleteModal}
                        data-testid="delete-article-btn"
                        class="flex items-center gap-2 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-red-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                        Delete Article
                      </button>
                    </div>
                  )}

                  {displayContent && (
                    <div
                      class="dark:prose-invert max-w-none prose prose-lg"
                      dangerouslySetInnerHTML={
                        marked.parse(displayContent) as string
                      }
                    ></div>
                  )}
                </div>

                {/* Interactions Footer */}
                <div class="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 border-gray-100 dark:border-gray-800 border-t">
                  <div class="flex justify-between items-center mb-8">
                    <div class="flex gap-4">
                      <button
                        onClick$={handleLike}
                        disabled={!auth.isAuthenticated}
                        data-testid="like-btn"
                        class={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                          news.user_reaction === "LIKE"
                            ? "bg-brand-neon/20 text-brand-neon dark:bg-brand-neon/20 dark:text-brand-neon border border-brand-neon/50"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span class="text-xl">👍</span>
                        <span class="font-bold">{news.likes}</span>
                      </button>
                      <button
                        onClick$={handleDislike}
                        disabled={!auth.isAuthenticated}
                        data-testid="dislike-btn"
                        class={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                          news.user_reaction === "DISLIKE"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span class="text-xl">👎</span>
                        <span class="font-bold">{news.dislikes}</span>
                      </button>
                    </div>
                    <div class="flex gap-4 text-gray-500 text-sm">
                      <span class="flex items-center gap-1">
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
                        >
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {news.views_count}
                      </span>
                      <span class="flex items-center gap-1">
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
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                          ></path>
                        </svg>
                        {news.clicks_count}
                      </span>
                    </div>
                  </div>

                  <NewsCommentsSection newsId={news.id} />
                </div>
              </article>
            );
          }}
        />

        <Modal
          title={t("job.confirm_delete_title") || "Confirm Deletion"}
          isOpen={state.showDeleteModal}
          onClose$={handleCloseDeleteModal}
          onConfirm$={handleDelete}
          isDestructive={true}
          isLoading={state.isDeleting}
          confirmText={t("common.delete") || "Delete"}
          cancelText={t("common.cancel") || "Cancel"}
        >
          <p>
            {t(
              "Are you sure you want to delete this news article? This action cannot be undone.",
            )}
          </p>
        </Modal>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "News Detail - IT Job Hub",
};
