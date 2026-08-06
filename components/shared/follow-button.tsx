"use client";

import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useFollow, useFollowStatus, useUnfollow } from "@/lib/hooks/use-follows";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  targetUserId: string;
  showCount?: boolean;
  className?: string;
}

export function FollowButton({
  targetUserId,
  showCount = false,
  className,
}: FollowButtonProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const follow = useFollow();
  const unfollow = useUnfollow();
  const { data: status, isLoading: statusLoading } = useFollowStatus(
    targetUserId,
    isAuthenticated && targetUserId !== user?.id
  );

  if (!isAuthenticated || authLoading) {
    return null;
  }

  const isSelf = targetUserId === user?.id;

  const handleClick = async () => {
    const isFollowing = status?.isFollowing;
    const mutation = isFollowing ? unfollow : follow;
    try {
      const result = await mutation.mutateAsync(targetUserId);
      if ("follow" in (result ?? {})) {
        toast.success("You are now following this user");
      } else {
        toast.success("Unfollowed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update follow");
    }
  };

  const followerCountLabel =
    showCount && status && status.followerCount > 0
      ? `${status.followerCount} ${status.followerCount === 1 ? "follower" : "followers"}`
      : undefined;

  if (isSelf) {
    if (!showCount) return null;
    return followerCountLabel ? (
      <span className={`text-sm text-muted-foreground ${className ?? ""}`}>
        {followerCountLabel}
      </span>
    ) : null;
  }

  const isFollowing = status?.isFollowing ?? false;
  const busy = follow.isPending || unfollow.isPending || statusLoading;

  return (
    <div className={`flex flex-col items-end gap-1 ${className ?? ""}`}>
      <Button
        variant={isFollowing ? "outline" : "default"}
        onClick={handleClick}
        disabled={busy || !targetUserId}
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : null}
        {isFollowing ? "Following" : "Follow"}
      </Button>
      {showCount && followerCountLabel ? (
        <span className="text-xs text-muted-foreground">{followerCountLabel}</span>
      ) : null}
    </div>
  );
}
