import {
  component$,
  useTask$,
  useStylesScoped$,
  Slot,
  useSignal,
  $,
  type PropFunction,
} from "@builder.io/qwik";
import styles from "./reaction-buttons.css?inline";
import { LikeButton } from "./like-button";
import { DislikeButton } from "./dislike-button";

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
}

export const ReactionButtons = component$<ReactionButtonsProps>((props) => {
  useStylesScoped$(styles);

  // Sync state between buttons
  const localLikes = useSignal(props.likes);
  const localDislikes = useSignal(props.dislikes);
  const localReaction = useSignal(props.userReaction);

  // Optimization: prevent prop sync while actively changing
  const isOptimistic = useSignal(false);

  // Sync with props when entityId changes or props update
  const prevId = useSignal(props.entityId);
  useTask$(({ track }) => {
    const id = track(() => props.entityId);

    // Automatically reset optimistic state if we switch entities
    if (prevId.value !== id) {
      isOptimistic.value = false;
      prevId.value = id;
    }

    const pLikes = track(() => props.likes);
    const pDislikes = track(() => props.dislikes);
    const pReaction = track(() => props.userReaction);

    // Only update if not currently waiting for an optimistic update or if entity ID changed
    // We use a small heuristic: if props haven't changed yet but we are optimistic, wait.
    if (!isOptimistic.value) {
      localLikes.value = pLikes;
      localDislikes.value = pDislikes;
      localReaction.value = pReaction;
    }

    console.log(
      `[ReactionButtons] Synced state for ${props.entityType}:${id}`,
      {
        likes: pLikes,
        dislikes: pDislikes,
        reaction: pReaction,
        wasOptimistic: isOptimistic.value,
      },
    );
  });

  const { onReactionChange$ } = props;

  const handleLikeChange$ = $((newActive: boolean) => {
    isOptimistic.value = true;
    const previousReaction = localReaction.value;
    localReaction.value = newActive ? "LIKE" : null;
    localLikes.value += newActive ? 1 : -1;

    if (newActive && previousReaction === "DISLIKE") {
      localDislikes.value = Math.max(0, localDislikes.value - 1);
    }

    if (onReactionChange$) {
      onReactionChange$("LIKE", localLikes.value);
    }

    // We don't reset isOptimistic here because LikeButton/DislikeButton
    // also have their own optimistic state and will trigger a refetch or prop update later.
    // However, to be safe, we'll allow prop sync after a timeout if something hangs
    setTimeout(() => {
      isOptimistic.value = false;
    }, 2000);
  });

  const handleDislikeChange$ = $((newActive: boolean) => {
    isOptimistic.value = true;
    const previousReaction = localReaction.value;
    localReaction.value = newActive ? "DISLIKE" : null;
    localDislikes.value += newActive ? 1 : -1;

    if (newActive && previousReaction === "LIKE") {
      localLikes.value = Math.max(0, localLikes.value - 1);
    }

    if (onReactionChange$) {
      onReactionChange$("DISLIKE", localDislikes.value);
    }

    setTimeout(() => {
      isOptimistic.value = false;
    }, 2000);
  });

  return (
    <div class={`reaction-buttons ${props.class || ""}`}>
      <LikeButton
        entityId={props.entityId}
        entityType={props.entityType}
        count={localLikes.value}
        active={localReaction.value === "LIKE"}
        onReactionChange$={handleLikeChange$}
        isAuthenticated={props.isAuthenticated}
      />

      <DislikeButton
        entityId={props.entityId}
        entityType={props.entityType}
        count={localDislikes.value}
        active={localReaction.value === "DISLIKE"}
        onReactionChange$={handleDislikeChange$}
        isAuthenticated={props.isAuthenticated}
      />

      <Slot />
    </div>
  );
});
