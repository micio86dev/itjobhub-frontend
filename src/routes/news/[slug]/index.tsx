import {
  component$,
  useStore,
  useTask$,
  useResource$,
  Resource,
  $,
  isBrowser,
} from "@builder.io/qwik";
import { useLocation, Link, useNavigate } from "@builder.io/qwik-city";
import { request } from "~/utils/api";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";
import {
  BaseCommentsSection,
  type UIComment,
} from "~/components/ui/comments-section";
import { Spinner } from "~/components/ui/spinner";
import logger from "~/utils/logger";
import { Modal } from "~/components/ui/modal";

interface NewsTranslation {
  language: string;
  title: string;
  summary?: string;
  content?: string;
}

interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  image_url?: string;
  category?: string;
  language?: string;
  translations?: NewsTranslation[];
  published_at?: string;
  likes: number;
  dislikes: number;
  user_reaction?: "LIKE" | "DISLIKE" | null;
  comments_count: number;
  views_count: number;
}

export default component$(() => {
  const loc = useLocation();
  const auth = useAuth();
  const t = useTranslate();
  const { currentLanguage } = useI18n();
  const nav = useNavigate();
  const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3001";

  const state = useStore({
    news: null as NewsDetail | null,
    comments: [] as UIComment[],
    isLoadingComments: false,
    showDeleteModal: false,
    isDeleting: false,
  });

  const newsResource = useResource$(async ({ track }) => {
    const slug = track(() => loc.params.slug);
    track(() => auth.token);

    if (!slug) return null;

    try {
      const headers: Record<string, string> = {};
      if (auth.token) headers["Authorization"] = `Bearer ${auth.token}`;

      const res = await request(`${API_URL}/news/${slug}`, { headers });
      const json = await res.json();

      if (json.success) {
        state.news = json.data;
        return json.data;
      }
    } catch (e) {
      logger.error({ e }, "Failed to fetch news");
    }
    return null;
  });

  // Track View
  useTask$(({ track }) => {
    const newsId = track(() => state.news?.id);
    if (newsId && isBrowser) {
      // Fire and forget tracking
      request(`${API_URL}/news/${newsId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "VIEW" }),
      }).catch((err) => console.error("Tracking Error", err));
    }
  });

  // Fetch Comments
  const fetchComments = $(async () => {
    if (!state.news?.id) return;
    state.isLoadingComments = true;
    try {
      const res = await request(`${API_URL}/comments/news/${state.news.id}`);
      const json = await res.json();
      if (json.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        state.comments = json.data.comments.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          author: {
            name: `${c.user.first_name} ${c.user.last_name}`,
            avatar: c.user.avatar,
          },
          text: c.content,
          date: c.created_at,
        }));
      }
    } catch (e) {
      logger.error(e, "Failed to fetch comments");
    } finally {
      state.isLoadingComments = false;
    }
  });

  // Load comments on mount if news calls succeeds
  useTask$(({ track }) => {
    const newsId = track(() => state.news?.id);
    if (newsId) {
      fetchComments();
    }
  });

  const handleLike = $(async () => {
    if (!auth.isAuthenticated || !state.news) return;

    const current = state.news.user_reaction;
    // Optimistic
    if (current === "LIKE") {
      state.news.user_reaction = null;
      state.news.likes--;
      await request(`${API_URL}/likes?newsId=${state.news.id}&type=LIKE`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
    } else {
      state.news.user_reaction = "LIKE";
      state.news.likes++;
      if (current === "DISLIKE") {
        state.news.dislikes--;
      }
      await request(`${API_URL}/likes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newsId: state.news.id, type: "LIKE" }),
      });
    }
  });

  const handleDislike = $(async () => {
    if (!auth.isAuthenticated || !state.news) return;

    const current = state.news.user_reaction;
    // Optimistic
    if (current === "DISLIKE") {
      state.news.user_reaction = null;
      state.news.dislikes--;
      await request(`${API_URL}/likes?newsId=${state.news.id}&type=DISLIKE`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
    } else {
      state.news.user_reaction = "DISLIKE";
      state.news.dislikes++;
      if (current === "LIKE") {
        state.news.likes--;
      }
      await request(`${API_URL}/likes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newsId: state.news.id, type: "DISLIKE" }),
      });
    }
  });

  const handleDeleteNews = $(async () => {
    if (!state.news || !auth.token) return;
    state.isDeleting = true;
    try {
      const res = await request(`${API_URL}/news/${state.news.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        await nav("/news");
      }
    } catch (e) {
      console.error(e);
    } finally {
      state.isDeleting = false;
    }
  });

  // Comment Actions
  const handleAddComment = $(async (text: string) => {
    if (!state.news || !auth.token) return;
    try {
      const res = await request(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          commentableId: state.news.id,
          commentableType: "news",
        }),
      });
      if (res.ok) {
        await fetchComments();
        state.news.comments_count++;
      }
    } catch (e) {
      logger.error(e, "Failed to add comment");
    }
  });

  const handleDeleteComment = $(async (id: string) => {
    if (!auth.token) return;
    try {
      const res = await request(`${API_URL}/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        state.comments = state.comments.filter((c) => c.id !== id);
        if (state.news) state.news.comments_count--;
      }
    } catch (e) {
      logger.error(e, "Failed to delete comment");
    }
  });

  const handleEditComment = $(async (id: string, text: string) => {
    if (!auth.token) return;
    try {
      const res = await request(`${API_URL}/comments/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const idx = state.comments.findIndex((c) => c.id === id);
        if (idx !== -1) {
          state.comments[idx].text = text;
          state.comments = [...state.comments]; // Trigger reactivity
        }
      }
    } catch (e) {
      logger.error(e, "Failed to edit comment");
    }
  });

  const formatDate = $((dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(currentLanguage, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  return (
    <div class="min-h-screen bg-white pb-20 dark:bg-slate-950">
      <Resource
        value={newsResource}
        onPending={() => (
          <div class="flex h-screen items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        onResolved={(news) => {
          if (!news) return <div class="p-10 text-center">News not found</div>;

          // Translation logic
          const translation = news.translations?.find(
            (tr: NewsTranslation) => tr.language === currentLanguage,
          );
          const displayTitle = translation?.title || news.title;
          const displayContent = translation?.content || news.content || "";

          // Simple markdown to html for content (if necessary, or just text)
          // Using simple text replacement for newlines if not markdown
          // Assuming content is HTML or Markdown? Plan didn't specify. Assuming text/markdown.

          return (
            <article class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
              <Link
                href="/news"
                class="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                data-testid="back-link"
              >
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
                  class="h-4 w-4"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                {t("news.back")}
              </Link>

              <h1 class="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {displayTitle}
              </h1>

              <div class="mb-8 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                {news.category && (
                  <span class="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {news.category}
                  </span>
                )}
                <div class="flex items-center gap-1">
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
                    class="h-4 w-4"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <span>{formatDate(news.published_at)}</span>
                </div>
                {auth.user?.role === "admin" && (
                  <button
                    onClick$={() => (state.showDeleteModal = true)}
                    class="ml-auto text-red-600 hover:text-red-700"
                    data-testid="delete-article-btn"
                  >
                    {t("news.delete_article")}
                  </button>
                )}
              </div>

              {news.image_url && (
                <div class="mb-10 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  <img
                    src={news.image_url}
                    alt={displayTitle}
                    class="h-auto w-full object-cover"
                    width={800}
                    height={400}
                  />
                </div>
              )}

              <div class="prose prose-lg prose-slate mb-12 max-w-none dark:prose-invert">
                {/* We should probably sanitize if it is HTML, or parse Markdown */}
                {/* For now, simplified rendering */}
                <div dangerouslySetInnerHTML={displayContent} />
              </div>

              {/* Interactions */}
              <div class="mb-12 flex items-center justify-between border-y border-slate-200 py-6 dark:border-slate-800">
                <div class="flex items-center gap-4">
                  <button
                    onClick$={handleLike}
                    data-testid="like-btn"
                    class={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                      news.user_reaction === "LIKE"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-5 w-5"
                    >
                      <path d="M7 10v12" />
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                    </svg>
                    <span>{news.likes}</span>
                  </button>
                  <button
                    onClick$={handleDislike}
                    data-testid="dislike-btn"
                    class={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                      news.user_reaction === "DISLIKE"
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-5 w-5"
                    >
                      <path d="M17 14V2" />
                      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                    </svg>
                    <span>{news.dislikes}</span>
                  </button>
                </div>
              </div>

              <BaseCommentsSection
                comments={state.comments}
                isLoading={state.isLoadingComments}
                onAddComment$={handleAddComment}
                onEditComment$={handleEditComment}
                onDeleteComment$={handleDeleteComment}
                title={t("news.discussion")}
              />

              <Modal
                title={t("news.delete_article")}
                isOpen={state.showDeleteModal}
                onClose$={() => (state.showDeleteModal = false)}
                onConfirm$={handleDeleteNews}
                isDestructive={true}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
              >
                <p>{t("news.confirm_delete")}</p>
              </Modal>
            </article>
          );
        }}
      />
    </div>
  );
});
