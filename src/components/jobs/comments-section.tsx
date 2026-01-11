import { component$, $, useStore, type QRL } from "@builder.io/qwik";
import { useJobs, getCommentsFromState } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";

interface CommentsSectionProps {
  jobId: string;
  onClose$?: QRL<() => void>;
}

export const CommentsSection = component$<CommentsSectionProps>(({ jobId, onClose$ }) => {
  const jobsContext = useJobs();
  const auth = useAuth();
  const t = useTranslate();
  const i18n = useI18n();

  // Extract values and signals to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const addCommentSignal = jobsContext.addCommentSignal;

  const state = useStore({
    commentText: '',
    isSubmitting: false,
    editingId: null as string | null,
    editContent: ''
  });

  const comments = getCommentsFromState(jobsContext.comments, jobId);

  const startEditing = $((commentId: string, currentText: string) => {
    state.editingId = commentId;
    state.editContent = currentText;
  });

  const cancelEditing = $(() => {
    state.editingId = null;
    state.editContent = '';
  });

  const saveEdit = $(async () => {
    if (!state.editingId || !state.editContent.trim()) return;

    await jobsContext.editComment$(state.editingId, state.editContent.trim());
    state.editingId = null;
    state.editContent = '';
  });

  const handleDelete = $(async (commentId: string) => {
    if (confirm(t('comments.confirm_delete') || 'Delete comment?')) { // Simple confirm for now
      await jobsContext.deleteComment$(commentId);
    }
  });

  const handleSubmitComment = $(async (e: Event) => {
    e.preventDefault();

    if (!isAuthenticated || !state.commentText.trim()) {
      return;
    }

    state.isSubmitting = true;

    try {
      // Trigger add comment through signal
      addCommentSignal.value = {
        jobId,
        author: {
          name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous User',
          avatar: user?.avatar
        },
        text: state.commentText.trim()
      };
      state.commentText = '';
      state.isSubmitting = false;

      // Close the comments section if callback provided
      if (onClose$) {
        console.log('Closing comments section...');
        await onClose$();
      }
    } catch {
      state.isSubmitting = false;
    }
  });

  // Get locale from current language
  const localeMap: Record<string, string> = {
    'it': 'it-IT',
    'en': 'en-US',
    'es': 'es-ES',
    'de': 'de-DE',
    'fr': 'fr-FR'
  };
  const locale = localeMap[i18n.currentLanguage] || 'it-IT';

  const formatCommentDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Use Intl.RelativeTimeFormat for consistent locale-aware formatting
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffSeconds < 60) return rtf.format(0, 'second'); // "now" / "ora"
    if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    if (diffDays < 7) return rtf.format(-diffDays, 'day');

    // For older dates, use date formatter
    const dtf = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    return dtf.format(date);
  };

  // Helper to get initials from name (first letter of first name + first letter of last name)
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Get current user initials
  const userInitials = user?.name
    ? getInitials(user.name)
    : user?.firstName && user?.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : 'U';

  return (
    <div class="border-t border-gray-100 pt-4 mt-4">
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          {t('comments.title')} ({comments.length})
        </h4>

        {/* Comment form */}
        {isAuthenticated ? (
          <form onSubmit$={handleSubmitComment} preventdefault:submit class="mb-4">
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    class="w-8 h-8 rounded-full object-cover"
                    width="32"
                    height="32"
                  />
                ) : (
                  <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-white">
                      {userInitials}
                    </span>
                  </div>
                )}
              </div>

              <div class="flex-1">
                <textarea
                  value={state.commentText}
                  onInput$={(e) => state.commentText = (e.target as HTMLTextAreaElement).value}
                  placeholder={t('comments.placeholder')}
                  rows={2}
                  class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />

                <div class="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!state.commentText.trim() || state.isSubmitting}
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.isSubmitting ? t('comments.submitting') : t('comments.submit')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div class="mb-4 p-3 bg-gray-50 rounded-md">
            <p class="text-sm text-gray-600 text-center">
              <a href="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
                {t('common.login')}
              </a>
              {' '}{t('comments.login_to_comment')}
            </p>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div class="space-y-4">
        {comments.length === 0 ? (
          <div class="text-center py-6">
            <div class="text-gray-400 mb-2">
              <svg class="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">{t('comments.no_comments')}</p>
            <p class="text-xs text-gray-400">{t('comments.be_first')}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} class="flex gap-3">
              <div class="flex-shrink-0">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    class="w-6 h-6 rounded-full object-cover"
                    width="24"
                    height="24"
                  />
                ) : (
                  <div class="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-white">
                      {getInitials(comment.author.name)}
                    </span>
                  </div>
                )}
              </div>

              <div class="flex-1">
                {state.editingId === comment.id ? (
                  <div class="bg-white rounded-lg p-3 border border-indigo-200 shadow-sm">
                    <textarea
                      value={state.editContent}
                      onInput$={(e) => state.editContent = (e.target as HTMLTextAreaElement).value}
                      class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none mb-2"
                      rows={2}
                    />
                    <div class="flex justify-end gap-2">
                      <button
                        onClick$={cancelEditing}
                        class="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick$={saveEdit}
                        class="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        disabled={!state.editContent.trim()}
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 group relative">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {comment.author.name}
                      </span>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">
                          {formatCommentDate(comment.date)}
                        </span>
                        {(user?.id === comment.userId || user?.role === 'admin') && (
                          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {user?.id === comment.userId && (
                              <button
                                onClick$={() => startEditing(comment.id, comment.text)}
                                class="p-1 text-gray-400 hover:text-indigo-600"
                                title={t('common.edit')}
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick$={() => handleDelete(comment.id)}
                              class="p-1 text-gray-400 hover:text-red-600"
                              title={t('common.delete')}
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});