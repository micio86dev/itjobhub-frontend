import {
  component$,
  useTask$,
  useStylesScoped$,
  Slot,
  useSignal,
  $,
  type PropFunction,
} from "@builder.io/qwik";
import { useAuth } from "~/contexts/auth";
import { request } from "~/utils/api";
import styles from "./reaction-buttons.css?inline";
import { LikeButton } from "./like-button";
import { DislikeButton } from "./dislike-button";
import { API_URL } from "~/constants";

interface ReactionButtonsProps {
  likes: number;
  dislikes: number;
  userReaction?: "LIKE" | "DISLIKE" | null;
  entityId: string;
  entityType: "job" | "news" | "comment";
  isAuthenticated: boolean;
  class?: string;
  onReactionChange$?: PropFunction<
    (type: "LIKE" | "DISLIKE", count: number) => void
  >;
  onReactionComplete$?: PropFunction<() => void>;
}

export const ReactionButtons = component$<ReactionButtonsProps>((props) => {
  useStylesScoped$(styles);
  const auth = useAuth();

  // Local state for optimistic updates
  const localLikes = useSignal(props.likes);
  const localDislikes = useSignal(props.dislikes);
  const localReaction = useSignal(props.userReaction);

  // Prevention of race conditions & redundant sync
  const isOptimistic = useSignal(false);
  const isPending = useSignal(false);
  const prevId = useSignal(props.entityId);

  // Sync with props when entityId changes
  useTask$(({ track }) => {
    const id = track(() => props.entityId);

    if (prevId.value !== id) {
      isOptimistic.value = false;
      prevId.value = id;

      // Reset local state when entity changes
      localLikes.value = props.likes;
      localDislikes.value = props.dislikes;
      localReaction.value = props.userReaction;
    }

    const pLikes = track(() => props.likes);
    const pDislikes = track(() => props.dislikes);
    const pReaction = track(() => props.userReaction);

    // Sync from props only if NOT in optimistic state
    if (!isOptimistic.value) {
      localLikes.value = pLikes;
      localDislikes.value = pDislikes;
      localReaction.value = pReaction;
    }
  });

  const handleReaction$ = $(async (type: "LIKE" | "DISLIKE") => {
    if (!auth.isAuthenticated || isPending.value) return;

    const previouslyActive = localReaction.value === type;
    const oppositeType = type === "LIKE" ? "DISLIKE" : "LIKE";
    const previouslyOpposite = localReaction.value === oppositeType;

    // --- OPTIMISTIC UPDATE ---
    isOptimistic.value = true;
    isPending.value = true;

    const oldLikes = localLikes.value;
    const oldDislikes = localDislikes.value;
    const oldReaction = localReaction.value;

    if (previouslyActive) {
      // Un-reacting
      localReaction.value = null;
      if (type === "LIKE") localLikes.value--;
      else localDislikes.value--;
    } else {
      // Reacting (and potentially swapping)
      localReaction.value = type;
      if (type === "LIKE") {
        localLikes.value++;
        if (previouslyOpposite) localDislikes.value--;
      } else {
        localDislikes.value++;
        if (previouslyOpposite) localLikes.value--;
      }
    }

    // Callback for parent components if needed
    if (props.onReactionChange$) {
      await props.onReactionChange$(
        type,
        type === "LIKE" ? localLikes.value : localDislikes.value,
      );
    }

    // --- API CALL ---
    try {
      const method = previouslyActive ? "DELETE" : "POST";
      const baseUrl = API_URL + "/likes";

      const url =
        method === "DELETE"
          ? `${baseUrl}?${props.entityType}Id=${props.entityId}&type=${type}`
          : baseUrl;

      const body =
        method === "POST"
          ? JSON.stringify({
              [`${props.entityType}Id`]: props.entityId,
              type: type,
            })
          : undefined;

      const response = await request(url, {
        method,
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) throw new Error("Reaction request failed");

      // Notify parent of completion (e.g. to trigger refetch)
      if (props.onReactionComplete$) {
        await props.onReactionComplete$();
      }
    } catch (e) {
      // Revert on failure
      localLikes.value = oldLikes;
      localDislikes.value = oldDislikes;
      localReaction.value = oldReaction;
      console.error("[ReactionButtons] Error:", e);
    } finally {
      isPending.value = false;
      // Small buffer before allowing prop sync to avoid UI flicker
      setTimeout(() => {
        isOptimistic.value = false;
      }, 1500);
    }
  });

  return (
    <div class={`reaction-buttons ${props.class || ""}`}>
      <LikeButton
        entityId={props.entityId}
        entityType={props.entityType}
        count={localLikes.value}
        active={localReaction.value === "LIKE"}
        onReactionChange$={$(() => handleReaction$("LIKE"))}
        isAuthenticated={props.isAuthenticated}
        disabled={isPending.value}
      />

      <DislikeButton
        entityId={props.entityId}
        entityType={props.entityType}
        count={localDislikes.value}
        active={localReaction.value === "DISLIKE"}
        onReactionChange$={$(() => handleReaction$("DISLIKE"))}
        isAuthenticated={props.isAuthenticated}
        disabled={isPending.value}
      />

      <Slot />
    </div>
  );
});
