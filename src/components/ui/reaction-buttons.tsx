import {
  component$,
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

  const { onReactionChange$ } = props;

  const handleLikeChange$ = $((newActive: boolean) => {
    const previousReaction = localReaction.value;
    localReaction.value = newActive ? "LIKE" : null;
    localLikes.value += newActive ? 1 : -1;

    if (newActive && previousReaction === "DISLIKE") {
      localDislikes.value = Math.max(0, localDislikes.value - 1);
    }

    if (onReactionChange$) {
      onReactionChange$("LIKE", localLikes.value);
    }
  });

  const handleDislikeChange$ = $((newActive: boolean) => {
    const previousReaction = localReaction.value;
    localReaction.value = newActive ? "DISLIKE" : null;
    localDislikes.value += newActive ? 1 : -1;

    if (newActive && previousReaction === "LIKE") {
      localLikes.value = Math.max(0, localLikes.value - 1);
    }

    if (onReactionChange$) {
      onReactionChange$("DISLIKE", localDislikes.value);
    }
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
