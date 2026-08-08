"use client";

import { UserRound, Users } from "lucide-react";
import { useFollowStatus } from "@/lib/hooks/use-follows";

export function FollowStats({ userId }: { userId: string }) {
  const { data: status } = useFollowStatus(userId);
  const followerCount = status?.followerCount ?? 0;
  const followingCount = status?.followingCount ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="inline-flex items-center gap-1.5">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{followerCount}</span>
        <span className="text-muted-foreground">
          {followerCount === 1 ? "follower" : "followers"}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <UserRound className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{followingCount}</span>
        <span className="text-muted-foreground">following</span>
      </span>
    </div>
  );
}
