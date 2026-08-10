"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useLikePost,
  useUnlikePost,
  useDeletePost,
} from "@/lib/hooks/use-community";
import { CommunityRole, type CommunityPostData } from "@/types/api/community";

interface PostCardProps {
  communityId: string;
  post: CommunityPostData;
  currentUserId?: string;
  isMember: boolean;
  userRole?: CommunityRole;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PostCard({
  communityId,
  post,
  currentUserId,
  isMember,
  userRole,
}: PostCardProps) {
  const [optimisticLiked, setOptimisticLiked] = useState(post.isLikedByUser ?? false);
  const [optimisticCount, setOptimisticCount] = useState(post.likeCount);

  const likePost = useLikePost(communityId);
  const unlikePost = useUnlikePost(communityId);
  const deletePost = useDeletePost(communityId);

  const canModerate =
    userRole === CommunityRole.ADMIN || userRole === CommunityRole.MODERATOR;
  const canDelete = canModerate || post.authorId === currentUserId;

  const liked = optimisticLiked;
  const count = optimisticCount;

  function toggleLike() {
    const next = !liked;
    setOptimisticLiked(next);
    setOptimisticCount(count + (next ? 1 : -1));
    const mutation = next ? likePost : unlikePost;
    mutation.mutate(post.id, {
      onError: () => {
        setOptimisticLiked(!next);
        setOptimisticCount(count + (next ? -1 : 1));
      },
      onSuccess: (data) => {
        if (data) {
          setOptimisticLiked(data.liked);
          setOptimisticCount(data.likeCount);
        }
      },
    });
  }

  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            {post.author?.avatarUrl ? (
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            ) : null}
            <AvatarFallback className="text-xs">
              {(post.author?.name ?? "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.author?.name ?? "Member"}</p>
            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete post"
            onClick={() => deletePost.mutate(post.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div
          className={cn(
            "mt-3 grid gap-2",
            post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {post.mediaUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${url}-${i}`}
              src={url}
              alt={`Post media ${i + 1}`}
              className="aspect-video w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-muted-foreground",
            liked && "text-destructive hover:text-destructive",
          )}
          disabled={!isMember && !currentUserId}
          onClick={toggleLike}
        >
          <Heart className={cn("size-4", liked && "fill-current")} />
          <span>{count}</span>
        </Button>
        <Link
          href={`/community/${communityId}?post=${post.id}`}
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageSquare className="size-4" />
          <span>{post.commentCount}</span>
        </Link>
      </div>
    </article>
  );
}
