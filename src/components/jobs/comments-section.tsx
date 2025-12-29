import { component$, $, useStore } from "@builder.io/qwik";
import { useJobs, getCommentsFromState } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";
import { useTranslate } from "~/contexts/i18n";

interface CommentsSectionProps {
  jobId: string;
}

export const CommentsSection = component$<CommentsSectionProps>(({ jobId }) => {
  const jobsContext = useJobs();
  const auth = useAuth();
  const t = useTranslate();
  
  // Extract values and signals to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const addCommentSignal = jobsContext.addCommentSignal;
  
  const state = useStore({
    commentText: '',
    isSubmitting: false
  });

  const comments = getCommentsFromState(jobsContext.comments, jobId);

  const handleSubmitComment = $(async (e: Event) => {
    e.preventDefault();
    
    if (!isAuthenticated || !state.commentText.trim()) {
      return;
    }

    state.isSubmitting = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Trigger add comment through signal
      addCommentSignal.value = {
        jobId,
        author: {
          name: user?.name || 'Anonymous User',
          avatar: undefined
        },
        text: state.commentText.trim()
      };
      state.commentText = '';
      state.isSubmitting = false;
    } catch {
      state.isSubmitting = false;
    }
  });

  const formatCommentDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div class="border-t border-gray-100 pt-4 mt-4">
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">
          {t('comments.title')} ({comments.length})
        </h4>
        
        {/* Comment form */}
        {isAuthenticated ? (
          <form onSubmit$={handleSubmitComment} class="mb-4">
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span class="text-xs font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
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
                    class="w-6 h-6 rounded-full"
                    width="24"
                    height="24"
                  />
                ) : (
                  <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-600">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div class="flex-1">
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-900">
                      {comment.author.name}
                    </span>
                    <span class="text-xs text-gray-500">
                      {formatCommentDate(comment.date)}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});