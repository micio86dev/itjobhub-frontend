import { component$, $, type QRL, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./job-card.css?inline";
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
  matchScore?: { score: number; label: "excellent" | "good" | "fair" | "low" };
}

export const JobCard = component$<JobCardProps>(
  ({ job, onToggleComments$, showComments = false, matchScore }) => {
    useStylesScoped$(styles);
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

      const currentlyLiked = job.user_reaction === "LIKE";
      const currentlyDisliked = job.user_reaction === "DISLIKE";

      // Optimistic local update
      if (currentlyLiked) {
        job.likes = Math.max(0, job.likes - 1);
        job.user_reaction = null;
        if (job.companyLikes !== undefined)
          job.companyLikes = Math.max(0, job.companyLikes - 1);
        likeJobSignal.value = { jobId: job.id, remove: true };
      } else {
        job.likes++;
        job.user_reaction = "LIKE";
        if (job.companyLikes !== undefined) job.companyLikes++;
        if (currentlyDisliked) {
          job.dislikes = Math.max(0, job.dislikes - 1);
          if (job.companyDislikes !== undefined)
            job.companyDislikes = Math.max(0, job.companyDislikes - 1);
        }
        likeJobSignal.value = {
          jobId: job.id,
          wasDisliked: currentlyDisliked,
        };
      }

      // Update company trust score
      if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
        job.companyScore =
          ((job.companyLikes + 8) /
            (job.companyLikes + job.companyDislikes + 10)) *
          100;
      }
    });

    const handleDislike = $(() => {
      if (!auth.isAuthenticated) return;

      const currentlyLiked = job.user_reaction === "LIKE";
      const currentlyDisliked = job.user_reaction === "DISLIKE";

      // Optimistic local update
      if (currentlyDisliked) {
        job.dislikes = Math.max(0, job.dislikes - 1);
        job.user_reaction = null;
        if (job.companyDislikes !== undefined)
          job.companyDislikes = Math.max(0, job.companyDislikes - 1);
        dislikeJobSignal.value = { jobId: job.id, remove: true };
      } else {
        job.dislikes++;
        job.user_reaction = "DISLIKE";
        if (job.companyDislikes !== undefined) job.companyDislikes++;
        if (currentlyLiked) {
          job.likes = Math.max(0, job.likes - 1);
          if (job.companyLikes !== undefined)
            job.companyLikes = Math.max(0, job.companyLikes - 1);
        }
        dislikeJobSignal.value = {
          jobId: job.id,
          wasLiked: currentlyLiked,
        };
      }

      // Update company trust score
      if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
        job.companyScore =
          ((job.companyLikes + 8) /
            (job.companyLikes + job.companyDislikes + 10)) *
          100;
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
    const todayAtMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const publishDateAtMidnight = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
    );

    const diffTime =
      todayAtMidnight.getTime() - publishDateAtMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    const dtf = new Intl.DateTimeFormat(lang, {
      day: "numeric",
      month: "short",
    });

    const dateDisplay =
      diffDays < 7 ? rtf.format(-diffDays, "day") : dtf.format(dateObj);

    return (
      <div class="job-card" data-testid="job-card">
        {/* Header */}
        <div class="header">
          <div class="header-content">
            <div class="company-info">
              <div class="logo-container">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    class="logo-image"
                    width="32"
                    height="32"
                  />
                ) : (
                  <svg
                    class="logo-placeholder"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h3 class="job-title">
                  <Link
                    href={`/jobs/detail/${job.id}`}
                    data-testid="job-card-link"
                  >
                    {job.title}
                  </Link>
                </h3>
                <div class="meta-row">
                  <span class="company-name">{job.company}</span>

                  <span class="trust-badge">
                    {Number(job.companyScore || 80).toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
                    % {t("job.trust_score")}
                  </span>

                  {matchScore && (
                    <span
                      class={`match-badge ${
                        matchScore.label === "excellent"
                          ? "match-excellent"
                          : matchScore.label === "good"
                            ? "match-good"
                            : matchScore.label === "fair"
                              ? "match-fair"
                              : "match-low"
                      }`}
                    >
                      ⚡ {matchScore.score}% {t(`match.${matchScore.label}`)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div class="action-column">
            <div class="date-display">
              <span>{dateDisplay}</span>
              {auth.isAuthenticated && (
                <button
                  onClick$={handleToggleFavorite}
                  class={`favorite-btn ${
                    job.is_favorite ? "favorite-active" : "favorite-inactive"
                  }`}
                  data-testid="favorite-button"
                  title={
                    job.is_favorite
                      ? t("job.remove_favorite")
                      : t("job.add_favorite")
                  }
                  aria-label={
                    job.is_favorite
                      ? t("job.remove_favorite")
                      : t("job.add_favorite")
                  }
                >
                  <svg
                    class="w-5 h-5"
                    fill={job.is_favorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              )}
            </div>
            {job.remote && (
              <span class="remote-badge">{t("job.remote_badge")}</span>
            )}
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div
            class="description prose prose-sm dark:prose-invert"
            dangerouslySetInnerHTML={marked.parse(job.description) as string}
          ></div>
        )}

        {/* Job Details */}
        <div class="details-grid">
          <div>
            <span class="detail-label">{t("job.seniority")}</span>
            <div class="detail-value-container">
              <span
                class={`badge-base ${
                  job.seniority === "junior"
                    ? "badge-green"
                    : job.seniority === "mid"
                      ? "badge-yellow"
                      : "badge-red"
                }`}
              >
                {t("jobs." + job.seniority)}
              </span>
            </div>
          </div>

          <div>
            <span class="detail-label">{t("job.availability")}</span>
            <div class="detail-value-container">
              <span class="badge-base badge-indigo">
                {t("jobs." + job.availability)}
              </span>
            </div>
          </div>

          <div>
            <span class="detail-label">{t("job.location")}</span>
            <div class="detail-value-container">
              <span class="location-text">
                {job.location || t("job.location_not_specified") || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Salary */}
        {job.salary && (
          <div class="mb-4">
            <span class="detail-label">{t("job.salary")}</span>
            <div class="detail-value-container">
              <span class="salary-text">{job.salary}</span>
            </div>
          </div>
        )}

        {/* Skills */}
        <div class="skills-container">
          <span class="detail-label mb-2 block">
            {t("job.skills_required")}
          </span>
          <div class="skills-list">
            {job.skills.map((skill) => (
              <span key={skill} class="badge-base badge-gray">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div class="footer-actions">
          <div class="reaction-buttons">
            {/* Like/Dislike buttons */}
            <button
              onClick$={handleLike}
              disabled={!auth.isAuthenticated}
              title={t("job.like")}
              data-testid="like-button"
              class={`reaction-btn ${
                job.user_reaction === "LIKE"
                  ? "reaction-btn-like-active"
                  : "reaction-btn-like-inactive"
              }`}
            >
              <span class="text-lg">👍</span>
              <span class="text-sm font-medium" data-testid="like-count">
                {job.likes}
              </span>
            </button>

            <button
              onClick$={handleDislike}
              disabled={!auth.isAuthenticated}
              title={t("job.dislike")}
              data-testid="dislike-button"
              class={`reaction-btn ${
                job.user_reaction === "DISLIKE"
                  ? "reaction-btn-dislike-active"
                  : "reaction-btn-dislike-inactive"
              }`}
            >
              <span class="text-lg">👎</span>
              <span class="text-sm font-medium" data-testid="dislike-count">
                {job.dislikes}
              </span>
            </button>

            {/* Comments button - Only show if toggle function is provided */}
            {onToggleComments$ && (
              <button
                onClick$={$(() => onToggleComments$(job.id))}
                class={`comments-btn ${
                  showComments ? "comments-btn-active" : "comments-btn-inactive"
                }`}
              >
                <span class="text-lg">💬</span>
                <span class="text-sm font-medium">
                  {job.comments_count !== undefined
                    ? job.comments_count
                    : getCommentsFromState(jobsContext.comments, job.id).length}
                </span>
              </button>
            )}

            {/* Views and Clicks Counters */}
            <div class="stats-container">
              <span class="flex items-center" title={t("job.views_count")}>
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {job.views_count || 0}
              </span>
              <span class="flex items-center" title={t("job.clicks_count")}>
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                {job.clicks_count || 0}
              </span>
            </div>

            {/* Apply tracking logic needs to happen on click too, usually on detail page but if we track here too... 
              Actually user asked to track apply click. The Apply button is here. */}
          </div>

          {/* External link */}
          {/* Link to detail page */}
          <Link href={`/jobs/detail/${job.id}`} class="apply-btn">
            <span>{t("job.apply")}</span>
            <svg class="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Login prompt for non-authenticated users */}
        {!auth.isAuthenticated && <LoginPrompt />}
      </div>
    );
  },
);
