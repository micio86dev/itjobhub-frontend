import { component$, useStylesScoped$, type QRL } from "@builder.io/qwik";
import styles from "./reaction-buttons.css?inline";

interface ReactionButtonsProps {
  likes: number;
  dislikes: number;
  userReaction?: "LIKE" | "DISLIKE" | null;
  onLike$: QRL<() => void>;
  onDislike$: QRL<() => void>;
  isAuthenticated: boolean;
  likeTitle?: string;
  dislikeTitle?: string;
}

export const ReactionButtons = component$<ReactionButtonsProps>(
  ({
    likes,
    dislikes,
    userReaction,
    onLike$,
    onDislike$,
    isAuthenticated,
    likeTitle,
    dislikeTitle,
  }) => {
    useStylesScoped$(styles);

    return (
      <div class="reaction-buttons">
        <button
          onClick$={onLike$}
          disabled={!isAuthenticated}
          title={likeTitle}
          data-testid="like-button"
          class={`reaction-btn ${
            userReaction === "LIKE"
              ? "reaction-btn-like-active"
              : "reaction-btn-like-inactive"
          }`}
        >
          <svg
            class="reaction-icon-svg"
            fill={userReaction === "LIKE" ? "currentColor" : "none"}
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
          <span class="reaction-count" data-testid="like-count">
            {likes}
          </span>
        </button>

        <button
          onClick$={onDislike$}
          disabled={!isAuthenticated}
          title={dislikeTitle}
          data-testid="dislike-button"
          class={`reaction-btn ${
            userReaction === "DISLIKE"
              ? "reaction-btn-dislike-active"
              : "reaction-btn-dislike-inactive"
          }`}
        >
          <svg
            class="reaction-icon-svg"
            fill={userReaction === "DISLIKE" ? "currentColor" : "none"}
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
          <span class="reaction-count" data-testid="dislike-count">
            {dislikes}
          </span>
        </button>
      </div>
    );
  },
);
