import {
  component$,
  useStylesScoped$,
  type PropFunction,
} from "@builder.io/qwik";
import styles from "./reaction-buttons.css?inline";

interface DislikeButtonProps {
  entityId: string;
  entityType: "job" | "news" | "comment";
  count: number;
  active: boolean;
  onReactionChange$?: PropFunction<() => void>;
  isAuthenticated: boolean;
  disabled?: boolean;
}

export const DislikeButton = component$<DislikeButtonProps>((props) => {
  useStylesScoped$(styles);

  const { onReactionChange$, disabled, active, count, isAuthenticated } = props;

  return (
    <button
      onClick$={onReactionChange$}
      disabled={!isAuthenticated || disabled}
      class={`reaction-btn ${active ? "reaction-btn-dislike-active" : "reaction-btn-dislike-inactive"}`}
      data-testid="dislike-button"
      data-active={String(active)}
      type="button"
    >
      <svg
        class="reaction-icon-svg"
        fill={active ? "currentColor" : "none"}
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
        {count}
      </span>
    </button>
  );
});
