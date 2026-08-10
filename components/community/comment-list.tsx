"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";
import {
  usePostComments,
  useCreateComment,
  useDeleteComment,
} from "@/lib/hooks/use-community";
import { CommunityRole, type CommunityCommentData } from "@/types/api/community";

interface CommentListProps {
  communityId: string;
  postId: string;
  currentUserId?: string;
  userRole?: CommunityRole;
}

export function CommentList({
  communityId,
  postId,
  currentUserId,
  userRole,
}: CommentListProps) {
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const { data, isLoading, error } = usePostComments(communityId, postId, {
    page,
    limit: 10,
  });
  const createComment = useCreateComment(communityId, postId);
  const deleteComment = useDeleteComment(communityId, postId);

  const comments = data?.comments ?? [];
  const pagination = data?.pagination;

  const canModerate =
    userRole === CommunityRole.ADMIN || userRole === CommunityRole.MODERATOR;

  function submit() {
    const trimmed = content.trim();
    if (!trimmed) return;
    createComment.mutate(
      { content: trimmed },
      {
        onSuccess: () => {
          setContent("");
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment…"
          className="min-h-12 flex-1"
        />
        <Button
          onClick={submit}
          disabled={!content.trim() || createComment.isPending}
          className="h-auto shrink-0"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline">Post</span>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}

      {!isLoading && comments.length === 0 && !error && (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Be the first to join the conversation"
        />
      )}

      <div className="space-y-3">
        {comments.map((comment: CommunityCommentData) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            canDelete={canModerate || comment.authorId === currentUserId}
            onDelete={() => deleteComment.mutate(comment.id)}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: CommunityCommentData;
  canDelete: boolean;
  onDelete: () => void;
}

function CommentItem({ comment, canDelete, onDelete }: CommentItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-8">
        {comment.author?.avatarUrl ? (
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
        ) : null}
        <AvatarFallback className="text-xs">
          {(comment.author?.name ?? "U").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-medium">{comment.author?.name ?? "Member"}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Delete comment"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm">{comment.content}</p>
      </div>
    </div>
  );
}
