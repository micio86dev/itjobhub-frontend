import { component$, useStylesScoped$, type QRL } from "@builder.io/qwik";
import styles from "./job-header.css?inline";
import { Link } from "@builder.io/qwik-city";
import { useTranslate } from "~/contexts/i18n";
import type { JobListing } from "~/contexts/jobs";

interface JobHeaderProps {
  job: JobListing;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLike$: QRL<() => void>;
  onDislike$: QRL<() => void>;
  onToggleFavorite$: QRL<() => void>;
  onDelete$: QRL<() => void>;
  onApplyClick$: QRL<() => void>;
}

export const JobHeader = component$<JobHeaderProps>(
  ({
    job,
    isAuthenticated,
    isAdmin,
    onLike$,
    onDislike$,
    onToggleFavorite$,
    onDelete$,
    onApplyClick$,
  }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    return (
      <div class="heroHeader">
        <div class="headerContent">
          <div class="flex items-center gap-6">
            <div class="companyLogoContainer">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  width="80"
                  height="80"
                  class="companyLogo"
                />
              ) : (
                <svg
                  class="companyLogoPlaceholder"
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
              <h1 class="jobTitle">{job.title}</h1>
              <div class="jobMeta">
                <span class="companyName">{job.company}</span>
                <span class="location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="locationIcon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {job.location || t("job.location_not_specified")}
                </span>
              </div>
            </div>
          </div>

          <div class="actionsContainer">
            <div class="reactionButtons">
              <button
                onClick$={onLike$}
                disabled={!isAuthenticated}
                title={t("job.like")}
                data-testid="like-button"
                class={`likeButton ${job.user_reaction === "LIKE" ? "likeButtonActive" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""} `}
              >
                <span class="reactionIcon">👍</span>
                <span class="reactionCount" data-testid="like-count">
                  {job.likes || 0}
                </span>
              </button>
              <button
                onClick$={onDislike$}
                disabled={!isAuthenticated}
                title={t("job.dislike")}
                data-testid="dislike-button"
                class={`dislikeButton ${job.user_reaction === "DISLIKE" ? "dislikeButtonActive" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""} `}
              >
                <span class="reactionIcon">👎</span>
                <span class="reactionCount" data-testid="dislike-count">
                  {job.dislikes || 0}
                </span>
              </button>
            </div>

            <button
              onClick$={onToggleFavorite$}
              disabled={!isAuthenticated}
              data-testid="favorite-button"
              class={`favoriteButton ${job.is_favorite ? "favoriteButtonActive" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""} `}
              title={
                job.is_favorite
                  ? t("job.remove_favorite")
                  : t("job.add_favorite")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class={`favoriteIcon ${job.is_favorite ? "fill-current" : ""} `}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>

            <a
              href={job.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick$={onApplyClick$}
              class="applyButton"
              data-testid="apply-button"
            >
              {t("job.apply")}
            </a>

            {isAdmin && (
              <button
                onClick$={onDelete$}
                class="deleteButton"
                data-testid="delete-button"
              >
                {t("job.delete")}
              </button>
            )}

            {!isAuthenticated && (
              <span class="loginHint">
                <Link href="/login" class="link">
                  {t("common.login")}
                </Link>{" "}
                {t("common.or").toLowerCase()}{" "}
                <Link href="/register" class="link">
                  {t("common.register").toLowerCase()}
                </Link>{" "}
                {t("job.apply_login_required")}
              </span>
            )}
          </div>
        </div>

        {/* Stats/Badges Row */}
        <div class="badgesRow">
          <div class="badge">
            {t("job.seniority")}:{" "}
            <span class="capitalize seniorityValue">
              {t("jobs." + (job.seniority || "unknown"))}
            </span>
          </div>
          <div class="badge">
            {t("job.availability")}:{" "}
            <span class="availabilityValue">
              {t("jobs." + (job.availability || "full_time"))}
            </span>
          </div>
          {job.remote && (
            <div class="remoteBadge">🌐 {t("job.remote_badge")}</div>
          )}
          {job.salary && <div class="salaryBadge">💰 {job.salary}</div>}
        </div>

        {/* Tracking Stats */}
        <div class="trackingStats">
          <span class="statItem" title={t("job.views_count")}>
            <svg
              class="statIcon"
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
            {job.views_count || 0} {t("job.views")}
          </span>
          <span class="statItem" title={t("job.clicks_count")}>
            <svg
              class="statIcon"
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
            {job.clicks_count || 0} {t("job.applications")}
          </span>
        </div>
      </div>
    );
  },
);
