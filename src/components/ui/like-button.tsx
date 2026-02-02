import {
  component$,
  $,
  useSignal,
  useStylesScoped$,
  type PropFunction,
} from "@builder.io/qwik";
import { useAuth } from "~/contexts/auth";
import { request } from "~/utils/api";
import styles from "./reaction-buttons.css?inline";

interface LikeButtonProps {
  entityId: string;
  entityType: "job" | "news" | "comment";
  count: number;
  active: boolean;
  onReactionChange$?: PropFunction<(newActive: boolean) => void>;
  isAuthenticated: boolean;
  disabled?: boolean;
}

export const LikeButton = component$<LikeButtonProps>((props) => {
  useStylesScoped$(styles);
  const auth = useAuth();

  // Local signal for optimistic updates
  const isOptimistic = useSignal(false);
  const localActive = useSignal(props.active);
  const localCount = useSignal(props.count);

  const { onReactionChange$, disabled, entityType, entityId } = props;

  const handleClick$ = $(async () => {
    if (!auth.isAuthenticated || disabled) return;

    const previouslyActive = localActive.value;

    // Optimistic Update
    localActive.value = !previouslyActive;
    localCount.value += previouslyActive ? -1 : 1;
    isOptimistic.value = true;

    if (onReactionChange$) {
      await onReactionChange$(localActive.value);
    }

    try {
      const method = previouslyActive ? "DELETE" : "POST";
      const baseUrl = import.meta.env.PUBLIC_API_URL + "/likes";

      const url =
        method === "DELETE"
          ? `${baseUrl}?${entityType}Id=${entityId}&type=LIKE`
          : baseUrl;

      const body =
        method === "POST"
          ? JSON.stringify({ [`${entityType}Id`]: entityId, type: "LIKE" })
          : undefined;

      const response = await request(url, {
        method,
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        throw new Error("Reaction failed");
      }
    } catch (e) {
      // Revert on error
      localActive.value = previouslyActive;
      localCount.value += previouslyActive ? 1 : -1;
      console.error("Like failed", e);
    } finally {
      isOptimistic.value = false;
    }
  });

  // Sync with props if not in middle of optimistic update
  if (!isOptimistic.value) {
    localActive.value = props.active;
    localCount.value = props.count;
  }

  return (
    <button
      onClick$={handleClick$}
      disabled={!auth.isAuthenticated || props.disabled}
      class={`reaction-btn ${localActive.value ? "reaction-btn-like-active" : "reaction-btn-like-inactive"}`}
      data-testid="like-button"
    >
      <svg
        class="reaction-icon-svg"
        fill={localActive.value ? "currentColor" : "none"}
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
        {localCount.value}
      </span>
    </button>
  );
});
