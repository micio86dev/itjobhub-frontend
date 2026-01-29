import { component$, $, useTask$, useStore } from "@builder.io/qwik";
import { useAuth } from "~/contexts/auth";
import { useTranslate } from "~/contexts/i18n";
import {
  BaseCommentsSection,
  type UIComment,
} from "~/components/ui/comments-section";
import { request } from "~/utils/api";

interface CommentsSectionProps {
  newsId: string;
}

interface Comment {
  id: string;
  userId: string;
  author: {
    name: string;
    avatar?: string;
  };
  text: string;
  date: Date;
}

export const NewsCommentsSection = component$<CommentsSectionProps>((props) => {
  const { newsId } = props;
  const auth = useAuth();
  const t = useTranslate();
  const anonymousUserLabel = t("comments.anonymous_user");

  const state = useStore({
    comments: [] as Comment[],
    isLoading: false,
  });

  useTask$(async ({ track }) => {
    const id = track(() => newsId);
    if (id) {
      state.isLoading = true;
      try {
        const res = await request(
          `${import.meta.env.PUBLIC_API_URL}/comments/news/${id}`,
        );
        const data = await res.json();
        if (data.success && data.data.comments) {
          state.comments = data.data.comments.map(
            (c: {
              id: string;
              user_id: string;
              user: {
                first_name: string;
                last_name: string;
                avatar?: string;
              };
              content: string;
              created_at: string;
            }) => ({
              id: c.id,
              userId: c.user_id,
              author: {
                name: `${c.user.first_name} ${c.user.last_name}`,
                avatar: c.user.avatar,
              },
              text: c.content,
              date: new Date(c.created_at),
            }),
          );
        }
      } catch (e) {
        console.error("Failed to fetch comments", e);
      } finally {
        state.isLoading = false;
      }
    }
  });

  const addComment = $(async (text: string) => {
    if (!auth.token) return;
    try {
      const res = await request(`${import.meta.env.PUBLIC_API_URL}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentableId: newsId,
          commentableType: "news",
          content: text,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Determine author name/avatar locally or from response if it included user (likely not fully hydrated user in basic create response, assume current user)
        const newComment: Comment = {
          id: data.data.id,
          userId: auth.user?.id || "",
          author: {
            name:
              auth.user?.name ||
              `${auth.user?.firstName} ${auth.user?.lastName}` ||
              anonymousUserLabel,
            avatar: auth.user?.avatar,
          },
          text: text,
          date: new Date(),
        };
        state.comments = [...state.comments, newComment];
      }
    } catch (e) {
      console.error("Failed to add comment", e);
      // t() is not serializable inside $, use alert directly or handle UI error state
      alert("Failed to add comment");
    }
  });

  const editComment = $(async (id: string, text: string) => {
    if (!auth.token) return;

    // Optimistic
    const index = state.comments.findIndex((c) => c.id === id);
    if (index === -1) return;
    const oldText = state.comments[index].text;
    state.comments[index].text = text;

    try {
      const res = await request(
        `${import.meta.env.PUBLIC_API_URL}/comments/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: text }),
        },
      );
      if (!res.ok) throw new Error("Failed");
    } catch (e) {
      state.comments[index].text = oldText; // Revert
      console.error("Failed to edit comment", e);
      alert("Failed to edit comment");
    }
  });

  const deleteComment = $(async (id: string) => {
    if (!auth.token) return;

    // Store state purely for revert, avoid spreading proxy directly if unsafe is suspected, though usually fine.
    // Deep clone can be safer for revert if needed, but here structure is simple.
    // Just map to pure objects to be safe.
    const oldComments = state.comments.map((c) => ({ ...c }));

    state.comments = state.comments.filter((c) => c.id !== id);

    try {
      const res = await request(
        `${import.meta.env.PUBLIC_API_URL}/comments/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );
      if (!res.ok) throw new Error("Failed");
    } catch (e) {
      // Reconstitute state if failed
      state.comments = oldComments;
      console.error("Failed to delete comment", e);
      alert("Failed to delete comment");
    }
  });

  const uiComments: UIComment[] = state.comments.map((c) => ({
    id: c.id,
    userId: c.userId,
    author: c.author,
    text: c.text,
    date: c.date,
  }));

  return (
    <BaseCommentsSection
      comments={uiComments}
      onAddComment$={addComment}
      onEditComment$={editComment}
      onDeleteComment$={deleteComment}
    />
  );
});
