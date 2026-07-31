"use client";

import { Heart, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useOptimistic, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  getNoteContent,
  likeNoteComment,
  sendNoteComment,
} from "@/lib/api/pages";
import type { PublicNoteComment } from "@/lib/types/notes";

type NoteCommentsProps = {
  slug: string;
  initialComments: PublicNoteComment[];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export function NoteComments({ slug, initialComments }: NoteCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    content: "",
  });
  const [replyTarget, setReplyTarget] = useState<PublicNoteComment | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const [optimisticComments, addOptimisticLike] = useOptimistic(
    comments,
    (currentComments, commentId: string) =>
      updateComment(currentComments, commentId, (comment) => ({
        ...comment,
        liked: !comment.liked,
        likes: comment.liked
          ? Math.max(0, comment.likes - 1)
          : comment.likes + 1,
      }))
  );

  useEffect(() => {
    getNoteContent(slug).then((response) => {
      if (response?.data?.comments) setComments(response.data.comments);
    });
  }, [slug]);

  const updateField =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const payload = { ...form, parentId: replyTarget?.id || null };
      const response = await sendNoteComment(slug, payload);

      if (!response?.success || !response.data) {
        setMessage(response?.message || "Could not post comment.");
        return;
      }

      setComments((prev) =>
        replyTarget
          ? addReply(prev, replyTarget.id, response.data!)
          : [response.data!, ...prev]
      );

      setForm({ name: "", email: "", website: "", content: "" });
      setReplyTarget(null);
      setMessage("Comment posted.");
    });
  };

  const onLike = (id: string) => {
    setMessage("");

    startTransition(async () => {
      addOptimisticLike(id);

      const response = await likeNoteComment(slug, id);

      if (!response?.data) {
        setMessage("Could not update like.");
        return;
      }

      setComments((prev) =>
        updateComment(prev, id, (comment) => ({
          ...comment,
          likes: response.data?.likes ?? comment.likes,
          liked: response.data?.liked ?? comment.liked,
        }))
      );
    });
  };

  const renderComment = (comment: PublicNoteComment, depth = 0) => (
    <article
      key={comment.id}
      className="grid gap-3 border-b border-border/20 pb-5 sm:grid-cols-[3rem_minmax(0,1fr)]"
    >
      <div className="flex h-11 w-11 items-center justify-center bg-accent font-black">
        {comment.name.charAt(0).toUpperCase()}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{comment.name}</p>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {comment.content}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onLike(comment.id)}
            className="h-8 px-0 text-muted-foreground hover:text-primary"
          >
            <Heart
              className={`h-4 w-4 ${
                comment.liked ? "fill-primary text-primary" : ""
              }`}
            />
            {comment.likes}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setReplyTarget(comment)}
            className="h-8 px-0 text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            Reply
          </Button>
        </div>

        {comment.replies?.length ? (
          <div
            className={`mt-5 space-y-5 border-l border-border/25 pl-4 ${
              depth > 1 ? "ml-0" : "sm:ml-3"
            }`}
          >
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    </article>
  );

  return (
    <section className="border-t border-border/20 pt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-sketch text-3xl font-bold text-primary">
            Comments
          </p>
          <p className="text-sm text-muted-foreground">
            Leave a useful note. Name and email are required.
          </p>
        </div>

        <span className="font-mono text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {optimisticComments.length} total
        </span>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-5 grid gap-3 border border-border/25 bg-card/45 p-4"
      >
        {replyTarget ? (
          <div className="flex items-center justify-between gap-3 bg-accent/45 px-3 py-2 text-sm">
            <span>
              Replying to <strong>{replyTarget.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyTarget(null)}
              className="text-muted-foreground hover:text-primary"
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={form.name}
            onChange={updateField("name")}
            placeholder="Name"
            required
            className="h-11 rounded-none border border-border/35 bg-background/50 px-3 text-sm outline-none focus:border-primary"
          />

          <input
            value={form.email}
            onChange={updateField("email")}
            type="email"
            placeholder="Email"
            required
            className="h-11 rounded-none border border-border/35 bg-background/50 px-3 text-sm outline-none focus:border-primary"
          />

          <input
            value={form.website}
            onChange={updateField("website")}
            placeholder="Website, optional"
            className="h-11 rounded-none border border-border/35 bg-background/50 px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <textarea
          value={form.content}
          onChange={updateField("content")}
          placeholder="Join the discussion..."
          required
          className="min-h-32 rounded-none border border-border/35 bg-background/50 p-3 text-sm outline-none focus:border-primary"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-muted-foreground">
            {message}
          </p>

          <Button
            type="submit"
            disabled={isPending}
            className="rounded-none disabled:opacity-100 disabled:cursor-default"
          >
            <Send className="h-4 w-4" />
            Post comment
          </Button>
        </div>
      </form>

      {optimisticComments.length ? (
        <div className="mt-6 space-y-5">
          {optimisticComments.map((comment) => renderComment(comment))}
        </div>
      ) : null}
    </section>
  );
}

function updateComment(
  comments: PublicNoteComment[],
  id: string,
  updater: (comment: PublicNoteComment) => PublicNoteComment
): PublicNoteComment[] {
  return comments.map((comment) => {
    if (comment.id === id) return updater(comment);

    return {
      ...comment,
      replies: updateComment(comment.replies || [], id, updater),
    };
  });
}

function addReply(
  comments: PublicNoteComment[],
  parentId: string,
  reply: PublicNoteComment
): PublicNoteComment[] {
  return updateComment(comments, parentId, (comment) => ({
    ...comment,
    replies: [...(comment.replies || []), reply],
  }));
}
