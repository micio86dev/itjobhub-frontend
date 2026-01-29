import {
  component$,
  $,
  useStore,
  type PropFunction,
  useStylesScoped$,
} from "@builder.io/qwik";
import styles from "./comments-section.css?inline";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { Modal } from "~/components/ui/modal";
import { Spinner } from "~/components/ui/spinner";
import logger from "../../utils/logger";

export interface UIComment {
  id: string;
  userId: string;
  author: {
    name: string;
    avatar?: string;
  };
  text: string;
  date: Date;
}

interface BaseCommentsSectionProps {
  comments: UIComment[];
  title?: string;
  isLoading?: boolean;
  onAddComment$: PropFunction<(text: string) => Promise<void>>;
  onEditComment$: PropFunction<(id: string, text: string) => Promise<void>>;
  onDeleteComment$: PropFunction<(id: string) => Promise<void>>;
  onClose$?: PropFunction<() => void>;
  isExpandedDefault?: boolean;
}

export const BaseCommentsSection = component$<BaseCommentsSectionProps>(
  (props) => {
    const { comments, title, isExpandedDefault = true } = props;
    useStylesScoped$(styles);
    const auth = useAuth();
    const t = useTranslate();
    const i18n = useI18n();

    const state = useStore({
      commentText: "",
      isSubmitting: false,
      editingId: null as string | null,
      editContent: "",
      showDeleteModal: false,
      commentToDelete: null as string | null,
      isEditingSubmitting: false,
      isExpanded: isExpandedDefault,
    });

    const anonymousUser = t("comments.anonymous_user");

    // --- FUNZIONI ASINCRONE (QRL) ---
    // Queste rimangono QRL perché sono asincrone e complesse
    const saveEdit = $(async () => {
      if (!state.editingId || !state.editContent.trim()) return;

      state.isEditingSubmitting = true;
      try {
        await props.onEditComment$(state.editingId, state.editContent.trim());
        state.editingId = null;
        state.editContent = "";
      } finally {
        state.isEditingSubmitting = false;
      }
    });

    const confirmDelete = $(async () => {
      if (state.commentToDelete) {
        await props.onDeleteComment$(state.commentToDelete);
        state.showDeleteModal = false;
        state.commentToDelete = null;
      }
    });

    const cancelDelete = $(() => {
      state.showDeleteModal = false;
      state.commentToDelete = null;
    });

    const handleSubmitComment = $(async (e: Event) => {
      e.preventDefault();
      if (!auth.isAuthenticated || !state.commentText.trim()) return;

      state.isSubmitting = true;
      try {
        await props.onAddComment$(state.commentText.trim());
        state.commentText = "";
        if (props.onClose$) {
          await props.onClose$();
        }
      } catch (err) {
        logger.error({ error: err }, "Failed to submit comment");
      } finally {
        state.isSubmitting = false;
      }
    });

    // --- HELPER SINCRO (NON QRL) ---
    // Devono essere funzioni normali per essere usate nel render o catturate correttamente
    const formatCommentDate = (date: Date) => {
      const d = new Date(date);
      const localeMap: Record<string, string> = {
        it: "it-IT",
        en: "en-US",
        es: "es-ES",
        de: "de-DE",
        fr: "fr-FR",
      };
      const locale = localeMap[i18n.currentLanguage] || "it-IT";
      const now = new Date();
      const diffTime = now.getTime() - d.getTime();
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

      if (diffMinutes < 1) return t("comments.just_now") || "just now";
      if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
      if (diffHours < 24) return rtf.format(-diffHours, "hour");
      if (diffDays < 7) return rtf.format(-diffDays, "day");

      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    };

    const getInitials = (name: string) => {
      if (!name) return "U";
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    };

    const userInitials = auth.user?.name
      ? getInitials(auth.user.name)
      : auth.user?.firstName && auth.user?.lastName
        ? `${auth.user.firstName.charAt(0)}${auth.user.lastName.charAt(0)}`.toUpperCase()
        : "U";

    return (
      <div class="comments-container">
        <div class="comments-header-container">
          <div class="header-flex">
            <h4 class="comments-title">
              {title || t("comments.title")} ({comments.length})
            </h4>
            <button
              onClick$={$(() => (state.isExpanded = !state.isExpanded))}
              class="toggle-btn"
            >
              <svg
                class={`w-5 h-5 transform transition-transform ${state.isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {auth.isAuthenticated ? (
            <form
              onSubmit$={handleSubmitComment}
              preventdefault:submit
              class="comment-form"
            >
              <div class="form-flex">
                <div class="avatar-container">
                  {auth.user?.avatar ? (
                    <img
                      src={auth.user.avatar}
                      alt={auth.user.name || ""}
                      class="avatar-image"
                      width="32"
                      height="32"
                    />
                  ) : (
                    <div class="avatar-placeholder">
                      <span class="avatar-initials">{userInitials}</span>
                    </div>
                  )}
                </div>
                <div class="form-body">
                  <textarea
                    value={state.commentText}
                    onInput$={(e) =>
                      (state.commentText = (
                        e.target as HTMLTextAreaElement
                      ).value)
                    }
                    placeholder={t("comments.placeholder")}
                    rows={2}
                    class="comment-textarea"
                    data-testid="comment-input"
                  />
                  <div class="form-actions">
                    <button
                      type="submit"
                      disabled={!state.commentText.trim() || state.isSubmitting}
                      class="px-3 py-1.5 text-xs btn-primary"
                      data-testid="comment-submit"
                    >
                      {state.isSubmitting && (
                        <Spinner size="sm" class="mr-2 -ml-1" />
                      )}
                      {state.isSubmitting
                        ? t("comments.submitting")
                        : t("comments.submit")}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div class="login-prompt">
              <p class="login-text">
                <a href="/login" class="login-link">
                  {t("common.login")}
                </a>{" "}
                {t("comments.login_to_comment")}
              </p>
            </div>
          )}
        </div>

        {state.isExpanded && (
          <div class="comments-list">
            {comments.length === 0 ? (
              <div class="no-comments-container">
                <p class="no-comments-text">{t("comments.no_comments")}</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  class="comment-item"
                  data-testid="comment-item"
                >
                  <div class="comment-avatar-container">
                    {comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name || ""}
                        class="comment-avatar-image"
                        width="24"
                        height="24"
                      />
                    ) : (
                      <div class="comment-avatar-placeholder">
                        <span class="avatar-initials">
                          {getInitials(comment.author.name || anonymousUser)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div class="comment-body">
                    {state.editingId === comment.id ? (
                      <div class="edit-container">
                        <textarea
                          value={state.editContent}
                          onInput$={(e) =>
                            (state.editContent = (
                              e.target as HTMLTextAreaElement
                            ).value)
                          }
                          class="edit-textarea"
                          rows={2}
                        />
                        <div class="edit-actions">
                          <button
                            onClick$={() => {
                              state.editingId = null;
                              state.editContent = "";
                            }}
                            class="cancel-btn"
                          >
                            {t("common.cancel")}
                          </button>
                          <button
                            onClick$={saveEdit}
                            class="px-2 py-1 text-xs btn-primary"
                            disabled={
                              !state.editContent.trim() ||
                              state.isEditingSubmitting
                            }
                          >
                            {state.isEditingSubmitting ? (
                              <Spinner size="sm" />
                            ) : (
                              t("common.save")
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div class="group comment-content-container">
                        <div class="comment-header">
                          <span class="comment-author">
                            {comment.author.name || anonymousUser}
                          </span>
                          <div class="comment-meta">
                            <span class="comment-date">
                              {formatCommentDate(comment.date)}
                            </span>
                            {(auth.user?.id === comment.userId ||
                              auth.user?.role === "admin") && (
                              <div class="comment-actions">
                                {auth.user?.id === comment.userId && (
                                  <button
                                    onClick$={$(() => {
                                      state.editingId = comment.id;
                                      state.editContent = comment.text;
                                    })}
                                    class="action-btn-edit"
                                    data-testid="comment-edit"
                                  >
                                    <svg
                                      class="action-icon"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick$={$(() => {
                                    state.commentToDelete = comment.id;
                                    state.showDeleteModal = true;
                                  })}
                                  class="action-btn-delete"
                                  data-testid="comment-delete"
                                >
                                  <svg
                                    class="action-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p class="comment-text">{comment.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <Modal
          title={t("job.confirm_delete_title")}
          isOpen={state.showDeleteModal}
          onClose$={cancelDelete}
          onConfirm$={confirmDelete}
          isDestructive={true}
          confirmText={t("common.delete")}
          cancelText={t("common.cancel")}
        >
          <p>{t("comments.confirm_delete")}</p>
        </Modal>
      </div>
    );
  },
);
