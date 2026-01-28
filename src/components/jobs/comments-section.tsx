import { component$, $, useTask$, type PropFunction } from "@builder.io/qwik";
import { useJobs, getCommentsFromState } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";
import { useTranslate } from "~/contexts/i18n";
import {
  BaseCommentsSection,
  type UIComment,
} from "~/components/ui/comments-section";

interface CommentsSectionProps {
  jobId: string;
  onClose$?: PropFunction<() => void>;
}

export const CommentsSection = component$<CommentsSectionProps>(
  ({ jobId, onClose$ }) => {
    const jobsContext = useJobs();
    const auth = useAuth();
    const t = useTranslate();
    const anonymousUserLabel = t("comments.anonymous_user");

    const comments = getCommentsFromState(jobsContext.comments, jobId);

    useTask$(async ({ track }) => {
      const id = track(() => jobId);
      if (id) {
        await jobsContext.fetchComments$(id);
      }
    });

    const addComment = $(async (text: string) => {
      // Logic from previous handleSubmitComment
      jobsContext.addCommentSignal.value = {
        jobId,
        author: {
          name:
            auth.user?.name ||
            `${auth.user?.firstName || ""} ${auth.user?.lastName || ""}`.trim() ||
            `${auth.user?.firstName || ""} ${auth.user?.lastName || ""}`.trim() ||
            anonymousUserLabel,
          avatar: auth.user?.avatar,
        },
        text,
      };
    });

    const editComment = $(async (id: string, text: string) => {
      await jobsContext.editComment$(id, text);
    });

    const deleteComment = $(async (id: string) => {
      await jobsContext.deleteComment$(id);
    });

    // Map comments to UIComment type if needed (they match structurally mostly)
    const uiComments: UIComment[] = comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      author: c.author,
      text: c.text,
      date: c.date,
    }));

    // wrapper onClose$ if needed to match QRL type
    // In BaseCommentsSection it expects QRL<()=>void>
    // Here onClose$ is QRL in original? Yes in original it was QRL<()=>void>
    // But in the interface above I defined it as () => void which might be wrong if Qwik expects QRL.
    // Checked previous file, it was: onClose$?: QRL<() => void>;
    // Let's fix interface to match.

    return (
      <BaseCommentsSection
        comments={uiComments}
        onAddComment$={addComment}
        onEditComment$={editComment}
        onDeleteComment$={deleteComment}
        onClose$={onClose$}
      />
    );
  },
);
