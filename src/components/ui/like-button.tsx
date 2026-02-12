import {
  component$,
  useStylesScoped$,
  type PropFunction,
} from "@builder.io/qwik";
import styles from "./reaction-buttons.css?inline";

interface LikeButtonProps {
  entityId: string;
  entityType: "job" | "news" | "comment";
  count: number;
  active: boolean;
  onReactionChange$?: PropFunction<() => void>;
  isAuthenticated: boolean;
  disabled?: boolean;
}

export const LikeButton = component$<LikeButtonProps>((props) => {
  useStylesScoped$(styles);

  const { onReactionChange$, disabled, active, count, isAuthenticated } = props;

  return (
    <button
      onClick$={onReactionChange$}
      disabled={!isAuthenticated || disabled}
      class={`reaction-btn ${active ? "reaction-btn-like-active" : "reaction-btn-like-inactive"}`}
      data-testid="like-button"
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
          d="M14 10h4.708C19.743 10 20.5 10.895 20.5 12c0 .403-.122.778-.331 1.091l-2.43 3.645C17.431 17.203 16.746 18 15.865 18H9v-8l1.32-3.958a2 2 0 011.897-1.368H13a2 2 0 012 2v3.326L14 10zM9 18H5a2 2 0 01-2-2v-4a2 2 0 012-2h4v8z"
        />
      </svg>
      <span class="reaction-count" data-testid="like-count">
        {count}
      </span>
    </button>
  );
});
