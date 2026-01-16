import {
  component$,
  $,
  useStore,
  type QRL,
  useStylesScoped$,
} from "@builder.io/qwik";
import styles from "./comments-section.css?inline";
import { useJobs, getCommentsFromState } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";

import { Modal } from "~/components/ui/modal";

interface CommentsSectionProps {
  jobId: string;
  onClose$?: QRL<() => void>;
}

export const CommentsSection = component$<CommentsSectionProps>(
  ({ jobId, onClose$ }) => {
    useStylesScoped$(styles);
    const jobsContext = useJobs();
    const auth = useAuth();
    const t = useTranslate();
    const i18n = useI18n();

    // Extract signals only
    const addCommentSignal = jobsContext.addCommentSignal;

    const state = useStore({
      commentText: "",
      isSubmitting: false,
      editingId: null as string | null,
      editContent: "",
      showDeleteModal: false,
      commentToDelete: null as string | null,
    });

    const comments = getCommentsFromState(jobsContext.comments, jobId);

    const startEditing = $((commentId: string, currentText: string) => {
      state.editingId = commentId;
      state.editContent = currentText;
    });

    const cancelEditing = $(() => {
      state.editingId = null;
      state.editContent = "";
    });

    const saveEdit = $(async () => {
      if (!state.editingId || !state.editContent.trim()) return;

      await jobsContext.editComment$(state.editingId, state.editContent.trim());
      state.editingId = null;
      state.editContent = "";
    });

    const handleDelete = $((commentId: string) => {
      state.commentToDelete = commentId;
      state.showDeleteModal = true;
    });

    const confirmDelete = $(async () => {
      if (state.commentToDelete) {
        await jobsContext.deleteComment$(state.commentToDelete);
        state.showDeleteModal = false;
        state.commentToDelete = null;
      }
    });

    const handleSubmitComment = $(async (e: Event) => {
      e.preventDefault();

      if (!auth.isAuthenticated || !state.commentText.trim()) {
        return;
      }

      state.isSubmitting = true;

      try {
        // Trigger add comment through signal
        addCommentSignal.value = {
          jobId,
          author: {
            name:
              auth.user?.name ||
              `${auth.user?.firstName || ""} ${auth.user?.lastName || ""}`.trim() ||
              t("comments.anonymous_user"),
            avatar: auth.user?.avatar,
          },
          text: state.commentText.trim(),
        };
        state.commentText = "";
        state.isSubmitting = false;

        // Close the comments section if callback provided
        if (onClose$) {
          console.log("Closing comments section...");
          await onClose$();
        }
      } catch {
        state.isSubmitting = false;
      }
    });

    // Get locale from current language
    const localeMap: Record<string, string> = {
      it: "it-IT",
      en: "en-US",
      es: "es-ES",
      de: "de-DE",
      fr: "fr-FR",
    };
    const locale = localeMap[i18n.currentLanguage] || "it-IT";

    const formatCommentDate = $((date: Date) => {
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffTime / 1000);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Use Intl.RelativeTimeFormat for consistent locale-aware formatting
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

      if (diffSeconds < 60) return rtf.format(0, "second"); // "now" / "ora"
      if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
      if (diffHours < 24) return rtf.format(-diffHours, "hour");
      if (diffDays < 7) return rtf.format(-diffDays, "day");

      // For older dates, use date formatter
      const dtf = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      return dtf.format(date);
    });

    // Helper to get initials from name (first letter of first name + first letter of last name)
    const getInitials = (name: string) => {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    };

    // Get current user initials
    const userInitials = auth.user?.name
      ? getInitials(auth.user.name)
      : auth.user?.firstName && auth.user?.lastName
        ? `${auth.user.firstName.charAt(0)}${auth.user.lastName.charAt(0)}`.toUpperCase()
        : "U";

    return (
      <div class="comments-container">
        <div class="comments-header-container">
          <h4 class="comments-title">
            {t("comments.title")} ({comments.length})
          </h4>

          {/* Comment form */}
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
                      alt={auth.user.name || t("nav.profile")}
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
                  />

                  <div class="form-actions">
                    <button
                      type="submit"
                      disabled={!state.commentText.trim() || state.isSubmitting}
                      class="submit-btn"
                    >
                      {state.isSubmitting && (
                        <svg
                          class="loading-spinner"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="spinner-circle"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="spinner-path"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
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

        {/* Comments list */}
        <div class="comments-list">
          {comments.length === 0 ? (
            <div class="no-comments-container">
              <div class="no-comments-icon-container">
                <svg
                  class="no-comments-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p class="no-comments-text">{t("comments.no_comments")}</p>
              <p class="be-first-text">{t("comments.be_first")}</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} class="comment-item">
                <div class="comment-avatar-container">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      class="comment-avatar-image"
                      width="24"
                      height="24"
                    />
                  ) : (
                    <div class="comment-avatar-placeholder">
                      <span class="avatar-initials">
                        {getInitials(comment.author.name)}
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
                        <button onClick$={cancelEditing} class="cancel-btn">
                          {t("common.cancel")}
                        </button>
                        <button
                          onClick$={saveEdit}
                          class="save-btn"
                          disabled={!state.editContent.trim()}
                        >
                          {t("common.save")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div class="comment-content-container group">
                      <div class="comment-header">
                        <span class="comment-author">
                          {comment.author.name}
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
                                    onClick$={$(() =>
                                      startEditing(comment.id, comment.text)
                                    )}
                                    class="action-btn-edit"
                                    title={t("common.edit")}
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
                                  onClick$={$(() => handleDelete(comment.id))}
                                  class="action-btn-delete"
                                  title={t("common.delete")}
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

        <Modal
          title={t("job.confirm_delete_title")}
          isOpen={state.showDeleteModal}
          onClose$={() => {
            state.showDeleteModal = false;
            state.commentToDelete = null;
          }}
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
