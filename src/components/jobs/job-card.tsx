import { component$, $, type QRL } from "@builder.io/qwik";
import { marked } from "marked";
import { Link } from "@builder.io/qwik-city";
import type { JobListing } from "~/contexts/jobs";
import { useJobs, getCommentsFromState } from "~/contexts/jobs";
import { LoginPrompt } from "./login-prompt";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";

interface JobCardProps {
  job: JobListing;
  onToggleComments$?: QRL<(jobId: string) => void>;
  showComments?: boolean;
  matchScore?: { score: number; label: 'excellent' | 'good' | 'fair' | 'low' };
}

export const JobCard = component$<JobCardProps>(({ job, onToggleComments$, showComments = false, matchScore }) => {
  const jobsContext = useJobs();
  const auth = useAuth();
  const t = useTranslate();
  const i18n = useI18n();
  const lang = i18n.currentLanguage;

  // Extract signals to avoid serialization issues
  const likeJobSignal = jobsContext.likeJobSignal;
  const dislikeJobSignal = jobsContext.dislikeJobSignal;

  // Use job.user_reaction directly from props/context for reactive state


  const handleLike = $(() => {
    if (!auth.isAuthenticated) return;

    const currentlyLiked = job.user_reaction === 'LIKE';
    const currentlyDisliked = job.user_reaction === 'DISLIKE';

    // Optimistic local update
    if (currentlyLiked) {
      job.likes = Math.max(0, job.likes - 1);
      job.user_reaction = null;
      if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
      likeJobSignal.value = { jobId: job.id, remove: true };
    } else {
      job.likes++;
      job.user_reaction = 'LIKE';
      if (job.companyLikes !== undefined) job.companyLikes++;
      if (currentlyDisliked) {
        job.dislikes = Math.max(0, job.dislikes - 1);
        if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
      }
      likeJobSignal.value = {
        jobId: job.id,
        wasDisliked: currentlyDisliked
      };
    }

    // Update company trust score
    if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
      job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
    }
  });

  const handleDislike = $(() => {
    if (!auth.isAuthenticated) return;

    const currentlyLiked = job.user_reaction === 'LIKE';
    const currentlyDisliked = job.user_reaction === 'DISLIKE';

    // Optimistic local update
    if (currentlyDisliked) {
      job.dislikes = Math.max(0, job.dislikes - 1);
      job.user_reaction = null;
      if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
      dislikeJobSignal.value = { jobId: job.id, remove: true };
    } else {
      job.dislikes++;
      job.user_reaction = 'DISLIKE';
      if (job.companyDislikes !== undefined) job.companyDislikes++;
      if (currentlyLiked) {
        job.likes = Math.max(0, job.likes - 1);
        if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
      }
      dislikeJobSignal.value = {
        jobId: job.id,
        wasLiked: currentlyLiked
      };
    }

    // Update company trust score
    if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
      job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
    }
  });

  const handleToggleFavorite = $(async () => {
    if (!auth.isAuthenticated) return;
    await jobsContext.toggleFavorite$(job.id);
  });

  // Calculate date diff for rendering using calendar days
  // Ensure we have a real Date object (Qwik serializes dates in stores/props to strings)
  const dateObj = new Date(job.publishDate);
  const now = new Date();

  // Create dates at midnight for accurate day-by-day comparison
  const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const publishDateAtMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  const diffTime = todayAtMidnight.getTime() - publishDateAtMidnight.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const dtf = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' });

  const dateDisplay = diffDays < 7
    ? rtf.format(-diffDays, 'day')
    : dtf.format(dateObj);


  return (
    <div class="job-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 hover:shadow-md transition-shadow" data-testid="job-card">
      {/* Header */}
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  class="w-full h-full rounded object-cover"
                  width="32"
                  height="32"
                />
              ) : (
                <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Link href={`/jobs/detail/${job.id}`} data-testid="job-card-link">
                  {job.title}
                </Link>
              </h3>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {job.company}
                </span>

                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  {Number(job.companyScore || 80).toLocaleString(undefined, { maximumFractionDigits: 1 })}% {t('job.trust_score')}
                </span>

                {matchScore && (
                  <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${matchScore.label === 'excellent' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/30' :
                    matchScore.label === 'good' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 ring-1 ring-blue-500/30' :
                      matchScore.label === 'fair' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 ring-1 ring-amber-500/30' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ring-1 ring-gray-500/30'
                    }`}>
                    ⚡ {matchScore.score}% {t(`match.${matchScore.label}`)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div class="text-right flex flex-col items-end gap-1">
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {dateDisplay}
            </span>
            {auth.isAuthenticated && (
              <button
                onClick$={handleToggleFavorite}
                class={`p-1 rounded transition-colors ${job.is_favorite
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-yellow-500'
                  }`}
                data-testid="favorite-button"
                title={job.is_favorite ? t('job.remove_favorite') : t('job.add_favorite')}
                aria-label={job.is_favorite ? t('job.remove_favorite') : t('job.add_favorite')}
              >
                <svg class="w-5 h-5" fill={job.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            )}
          </div>
          {job.remote && (
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-green-200">
              {t('job.remote_badge')}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div
          class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 prose prose-sm dark:prose-invert"
          dangerouslySetInnerHTML={marked.parse(job.description) as string}
        ></div>
      )}

      {/* Job Details */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('job.seniority')}
          </span>
          <div class="mt-1">
            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.seniority === 'junior' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              job.seniority === 'mid' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
              {t('jobs.' + job.seniority)}
            </span>
          </div>
        </div>

        <div>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('job.availability')}
          </span>
          <div class="mt-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              {t('jobs.' + job.availability)}
            </span>
          </div>
        </div>

        <div>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('job.location')}
          </span>
          <div class="mt-1">
            <span class="text-sm text-gray-900 dark:text-gray-100">
              {job.location || t('job.location_not_specified') || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Salary */}
      {
        job.salary && (
          <div class="mb-4">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('job.salary')}
            </span>
            <div class="mt-1">
              <span class="text-sm font-semibold text-green-600">
                {job.salary}
              </span>
            </div>
          </div>
        )
      }

      {/* Skills */}
      <div class="mb-4">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
          {t('job.skills_required')}
        </span>
        <div class="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center space-x-4">
          {/* Like/Dislike buttons */}
          <button
            onClick$={handleLike}
            disabled={!auth.isAuthenticated}
            title={t('job.like')}
            data-testid="like-button"
            class={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${job.user_reaction === 'LIKE'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
              : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
              } ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span class="text-lg">👍</span>
            <span class="text-sm font-medium" data-testid="like-count">{job.likes}</span>
          </button>

          <button
            onClick$={handleDislike}
            disabled={!auth.isAuthenticated}
            title={t('job.dislike')}
            data-testid="dislike-button"
            class={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${job.user_reaction === 'DISLIKE'
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
              : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              } ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span class="text-lg">👎</span>
            <span class="text-sm font-medium" data-testid="dislike-count">{job.dislikes}</span>
          </button>

          {/* Comments button - Only show if toggle function is provided */}
          {onToggleComments$ && (
            <button
              onClick$={() => onToggleComments$!(job.id)}
              class={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${showComments
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                } cursor-pointer`}
            >
              <span class="text-lg">💬</span>
              <span class="text-sm font-medium">
                {job.comments_count !== undefined ? job.comments_count : getCommentsFromState(jobsContext.comments, job.id).length}
              </span>
            </button>
          )}

          {/* Views and Clicks Counters */}
          <div class="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500 ml-2 border-l border-gray-200 dark:border-gray-700 pl-3">
            <span class="flex items-center" title={t('job.views_count')}>
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {job.views_count || 0}
            </span>
            <span class="flex items-center" title={t('job.clicks_count')}>
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              {job.clicks_count || 0}
            </span>
          </div>

          {/* Apply tracking logic needs to happen on click too, usually on detail page but if we track here too... 
              Actually user asked to track apply click. The Apply button is here. */}
        </div>

        {/* External link */}
        {/* Link to detail page */}
        <Link
          href={`/jobs/detail/${job.id}`}
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <span>{t('job.apply')}</span>
          <svg class="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </Link>
      </div>

      {/* Login prompt for non-authenticated users */}
      {!auth.isAuthenticated && <LoginPrompt />}
    </div >
  );
});