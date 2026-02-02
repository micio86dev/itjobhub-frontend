import {
  component$,
  $,
  useStore,
  useTask$,
  useSignal,
  useStylesScoped$,
} from "@builder.io/qwik";
import { useAuth } from "~/contexts/auth";
import { useTranslate } from "~/contexts/i18n";
import { Modal } from "~/components/ui/modal";
import { Spinner } from "~/components/ui/spinner";
import { ReactionButtons } from "~/components/ui/reaction-buttons";
import { request } from "~/utils/api";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import styles from "./comments-section.css?inline";

interface CommentsSectionProps {
  ownerId: string;
  type: "news" | "job";
}

interface UIComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  likesCount: number;
  dislikesCount: number;
  userReaction: "LIKE" | "DISLIKE" | null;
  userHasLiked: boolean;
  replies: UIComment[];
  parentId?: string | null;
}

export const UnifiedCommentsSection = component$<CommentsSectionProps>(
  ({ ownerId, type }) => {
    useStylesScoped$(styles);
    const auth = useAuth();
    const t = useTranslate();

    const state = useStore({
      comments: [] as UIComment[],
      commentText: "",
      isSubmitting: false,
      commentToDelete: null as string | null,
      isDeleting: false,
      replyingTo: null as string | null,
      replyText: "",
    });

    const showDeleteModal = useSignal(false);

    // --- LOADING LOGIC ---
    useTask$(async ({ track }) => {
      track(() => ownerId);
      track(() => auth.isAuthenticated);

      try {
        const headers: Record<string, string> = {};
        if (auth.token) {
          headers.Authorization = `Bearer ${auth.token}`;
        }

        const res = await request(
          `${import.meta.env.PUBLIC_API_URL}/comments/${type}/${ownerId}?limit=50`,
          {
            headers,
          },
        );
        const data = await res.json();
        if (data.success) state.comments = data.data.comments;
      } catch (e) {
        console.error("Failed to fetch comments", e);
      }
    });

    // --- HANDLERS ---
    const handleAdd = $(async (parentId: string | null = null) => {
      const text = parentId ? state.replyText : state.commentText;
      if (!auth.token || !text.trim()) return;

      state.isSubmitting = true;
      try {
        const res = await request(
          `${import.meta.env.PUBLIC_API_URL}/comments`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              commentableId: ownerId,
              commentableType: type,
              content: text,
              parentId,
            }),
          },
        );
        if (res.ok) {
          // Refresh to get full populated data
          const headers: Record<string, string> = {};
          if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

          const refreshRes = await request(
            `${import.meta.env.PUBLIC_API_URL}/comments/${type}/${ownerId}?limit=50`,
            { headers },
          );
          const refreshData = await refreshRes.json();
          if (refreshData.success) state.comments = refreshData.data.comments;

          if (parentId) {
            state.replyingTo = null;
            state.replyText = "";
          } else {
            state.commentText = "";
          }
        }
      } finally {
        state.isSubmitting = false;
      }
    });

    const confirmDelete = $(async () => {
      if (!state.commentToDelete || !auth.token) return;
      state.isDeleting = true;
      try {
        const res = await request(
          `${import.meta.env.PUBLIC_API_URL}/comments/${state.commentToDelete}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${auth.token}` },
          },
        );
        if (res.ok) {
          // Recursive filter
          const deleteRecursive = (list: UIComment[]): UIComment[] => {
            return list
              .filter((c) => c.id !== state.commentToDelete)
              .map((c) => ({
                ...c,
                replies: deleteRecursive(c.replies || []),
              }));
          };
          state.comments = deleteRecursive(state.comments);
          showDeleteModal.value = false;
          state.commentToDelete = null;
        }
      } finally {
        state.isDeleting = false;
      }
    });

    // handleLike removed as it is now handled by ReactionButtons

    return (
      <div class="comments-wrapper">
        <h4 class="comments-title">
          {t("comments.title")} ({state.comments.length})
        </h4>

        {/* Main Input */}
        {auth.isAuthenticated ? (
          <div class="comment-input-group">
            <div class="input-avatar">
              {auth.user?.avatar ? (
                <img
                  src={auth.user.avatar}
                  class="avatar-image"
                  alt="Me"
                  width="40"
                  height="40"
                />
              ) : (
                <div class="avatar-placeholder">
                  {auth.user?.firstName?.charAt(0)}
                </div>
              )}
            </div>
            <div class="input-body">
              <textarea
                value={state.commentText}
                onInput$={(e) =>
                  (state.commentText = (e.target as HTMLTextAreaElement).value)
                }
                class="comment-textarea"
                placeholder={t("comments.placeholder_add")}
                rows={2}
              />
              <div class="input-actions">
                <button
                  onClick$={() => handleAdd(null)}
                  class="btn-primary btn-sm btn-submit-comment"
                  disabled={!state.commentText.trim() || state.isSubmitting}
                >
                  {state.isSubmitting ? <Spinner /> : t("comments.submit")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div class="login-prompt">
            <p>{t("comments.login_prompt")}</p>
          </div>
        )}

        {/* Comments List */}
        <div class="comments-list">
          {state.comments.map((comment) => (
            <div key={comment.id} class="comment-thread">
              {/* Root Comment Item */}
              <div class="comment-item">
                <div class="comment-avatar">
                  {comment.user.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.first_name}
                      class="avatar-img"
                      width="40"
                      height="40"
                    />
                  ) : (
                    <div class="avatar-initial">
                      {comment.user.first_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="author-name">
                      {comment.user.first_name} {comment.user.last_name}
                    </span>
                    <span class="comment-date">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </span>
                  </div>
                  <p class="comment-text">{comment.content}</p>

                  <div class="comment-actions">
                    <ReactionButtons
                      likes={comment.likesCount}
                      dislikes={comment.dislikesCount}
                      userReaction={comment.userReaction}
                      entityId={comment.id}
                      entityType="comment"
                      isAuthenticated={auth.isAuthenticated}
                    />

                    {auth.isAuthenticated && (
                      <button
                        class="btn-action btn-reply"
                        onClick$={() => {
                          state.replyingTo =
                            state.replyingTo === comment.id ? null : comment.id;
                          state.replyText = "";
                        }}
                      >
                        {t("comments.reply")}
                      </button>
                    )}

                    {(auth.user?.id === comment.user_id ||
                      auth.user?.role === "admin") && (
                      <button
                        onClick$={() => {
                          state.commentToDelete = comment.id;
                          showDeleteModal.value = true;
                        }}
                        class="btn-action btn-delete"
                      >
                        {t("common.delete")}
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {state.replyingTo === comment.id && (
                    <div class="reply-input-container">
                      <div class="input-avatar small">
                        {auth.user?.avatar ? (
                          <img
                            src={auth.user.avatar}
                            class="avatar-image"
                            alt="Me"
                            width="30"
                            height="30"
                          />
                        ) : (
                          <div class="avatar-placeholder">
                            {auth.user?.firstName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div class="input-body">
                        <textarea
                          value={state.replyText}
                          onInput$={(e) =>
                            (state.replyText = (
                              e.target as HTMLTextAreaElement
                            ).value)
                          }
                          class="comment-textarea reply-textarea"
                          placeholder={t("comments.placeholder_reply")}
                          rows={1}
                        />
                        <div class="input-actions">
                          <button
                            class="btn-cancel"
                            onClick$={() => (state.replyingTo = null)}
                          >
                            {t("common.cancel")}
                          </button>
                          <button
                            class="btn-primary btn-sm btn-submit-reply"
                            onClick$={() => handleAdd(comment.id)}
                            disabled={
                              !state.replyText.trim() || state.isSubmitting
                            }
                          >
                            {state.isSubmitting ? (
                              <Spinner />
                            ) : (
                              t("comments.reply")
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div class="replies-list">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} class="comment-item reply-item">
                          <div class="comment-avatar small">
                            {reply.user.avatar ? (
                              <img
                                src={reply.user.avatar}
                                alt={reply.user.first_name}
                                class="avatar-img"
                                width="30"
                                height="30"
                              />
                            ) : (
                              <div class="avatar-initial small">
                                {reply.user.first_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div class="comment-content">
                            <div class="comment-header">
                              <span class="author-name">
                                {reply.user.first_name} {reply.user.last_name}
                              </span>
                              <span class="comment-date">
                                {formatDistanceToNow(
                                  new Date(reply.created_at),
                                  { addSuffix: true, locale: it },
                                )}
                              </span>
                            </div>
                            <p class="comment-text">{reply.content}</p>
                            <div class="comment-actions">
                              <ReactionButtons
                                likes={reply.likesCount}
                                dislikes={reply.dislikesCount}
                                userReaction={reply.userReaction}
                                entityId={reply.id}
                                entityType="comment"
                                isAuthenticated={auth.isAuthenticated}
                              />

                              {(auth.user?.id === reply.user_id ||
                                auth.user?.role === "admin") && (
                                <button
                                  onClick$={() => {
                                    state.commentToDelete = reply.id;
                                    showDeleteModal.value = true;
                                  }}
                                  class="btn-action btn-delete"
                                >
                                  {t("common.delete")}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal
          title={t("common.confirm")}
          isOpen={showDeleteModal.value}
          onClose$={$(() => (showDeleteModal.value = false))}
          onConfirm$={confirmDelete}
          isDestructive={true}
          isLoading={state.isDeleting}
        >
          <p>{t("comments.confirm_delete")}</p>
        </Modal>
      </div>
    );
  },
);
