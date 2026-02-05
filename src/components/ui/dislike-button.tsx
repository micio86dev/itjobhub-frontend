import {
  component$,
  $,
  useSignal,
  useTask$,
  useStylesScoped$,
  type PropFunction,
} from "@builder.io/qwik";
import { useAuth } from "~/contexts/auth";
import { request } from "~/utils/api";
import styles from "./reaction-buttons.css?inline";

interface DislikeButtonProps {
  entityId: string;
  entityType: "job" | "news" | "comment";
  count: number;
  active: boolean;
  onReactionChange$?: PropFunction<(newActive: boolean) => void>;
  isAuthenticated: boolean;
  disabled?: boolean;
}

export const DislikeButton = component$<DislikeButtonProps>((props) => {
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
          ? `${baseUrl}?${entityType}Id=${entityId}&type=DISLIKE`
          : baseUrl;

      const body =
        method === "POST"
          ? JSON.stringify({ [`${entityType}Id`]: entityId, type: "DISLIKE" })
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
      console.error("Dislike failed", e);
    } finally {
      isOptimistic.value = false;
    }
  });

  // ✅ FIX: Sync with props using useTask$ instead of in render
  // Resets when entity changes or when props change and NOT in optimistic state
  useTask$(({ track }) => {
    track(() => props.entityId);

    // Also track props to pick up changes from parent (e.g. initial load or refetch)
    const pActive = track(() => props.active);
    const pCount = track(() => props.count);

    if (!isOptimistic.value) {
      localActive.value = pActive;
      localCount.value = pCount;
    }
  });

  return (
    <button
      onClick$={handleClick$}
      disabled={!auth.isAuthenticated || props.disabled}
      class={`reaction-btn ${localActive.value ? "reaction-btn-dislike-active" : "reaction-btn-dislike-inactive"}`}
      data-testid="dislike-button"
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
          d="M10 14H5.292C4.257 14 3.5 13.105 3.5 12c0-.403.122-.778.331-1.091l2.43-3.645C6.569 6.797 7.254 6 8.135 6H15v8l-1.32 3.958a2 2 0 01-1.897 1.368H11a2 2 0 01-2-2v-3.326L10 14zM15 6h4a2 2 0 012 2v4a2 2 0 01-2 2h-4V6z"
        />
      </svg>
      <span class="reaction-count" data-testid="dislike-count">
        {localCount.value}
      </span>
    </button>
  );
});
