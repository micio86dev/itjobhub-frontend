import {
  component$,
  useStylesScoped$,
  type PropFunction,
} from "@builder.io/qwik";
import styles from "./job-header.css?inline";
import { Link } from "@builder.io/qwik-city";
import { useTranslate } from "~/contexts/i18n";
import type { JobListing } from "~/contexts/jobs";

interface JobHeaderProps {
  job: JobListing;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLike$: PropFunction<() => void>;
  onDislike$: PropFunction<() => void>;
  onToggleFavorite$: PropFunction<() => void>;
  onDelete$: PropFunction<() => void>;
  onApplyClick$: PropFunction<() => void>;
}

export const JobHeader = component$<JobHeaderProps>((props) => {
  const { job, isAuthenticated, isAdmin } = props;
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
              onClick$={props.onLike$}
              disabled={!isAuthenticated}
              title={t("job.like")}
              data-testid="like-button"
              class={`likeButton ${job.user_reaction === "LIKE" ? "likeButtonActive" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""} `}
            >
              <svg
                class="reactionIcon"
                fill={job.user_reaction === "LIKE" ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 10h4.708C19.743 10 20.5 10.895 20.5 12c0 .403-.122.778-.331 1.091l-2.43 3.645C17.431 17.203 16.746 18 15.865 18H9v-8l1.32-3.958a2 2 0 011.897-1.368H13a2 2 0 012 2v3.326L14 10zM9 18H5a2 2 0 01-2-2v-4a2 2 0 012-2h4v8z"
                />
              </svg>
              <span class="reactionCount" data-testid="like-count">
                {job.likes || 0}
              </span>
            </button>
            <button
              onClick$={props.onDislike$}
              disabled={!isAuthenticated}
              title={t("job.dislike")}
              data-testid="dislike-button"
              class={`dislikeButton ${job.user_reaction === "DISLIKE" ? "dislikeButtonActive" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""} `}
            >
              <svg
                class="reactionIcon"
                fill={job.user_reaction === "DISLIKE" ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14H5.292C4.257 14 3.5 13.105 3.5 12c0-.403.122-.778.331-1.091l2.43-3.645C6.569 6.797 7.254 6 8.135 6H15v8l-1.32 3.958a2 2 0 01-1.897 1.368H11a2 2 0 01-2-2v-3.326L10 14zM15 6h4a2 2 0 012 2v4a2 2 0 01-2 2h-4V6z"
                />
              </svg>
              <span class="reactionCount" data-testid="dislike-count">
                {job.dislikes || 0}
              </span>
            </button>
          </div>

          <button
            onClick$={props.onToggleFavorite$}
            disabled={!isAuthenticated}
            data-testid="favorite-button"
            class={`favoriteButton ${job.is_favorite ? "favoriteButtonActive" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""} `}
            title={
              job.is_favorite ? t("job.remove_favorite") : t("job.add_favorite")
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
            onClick$={props.onApplyClick$}
            class="applyButton"
            data-testid="apply-button"
          >
            {t("job.apply")}
          </a>

          {isAdmin && (
            <button
              onClick$={props.onDelete$}
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
});
