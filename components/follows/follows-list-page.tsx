"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  LoaderCircle,
  UserCheck,
  UserMinus,
  UserRound,
} from "lucide-react";
import {
  useMyFollowers,
  useMyFollowing,
  useUserFollowers,
  useUserFollowing,
  useAdminRemoveFollower,
} from "@/lib/hooks/use-follows";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import type { FollowUserData } from "@/types/api/follows";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";

const PAGE_SIZE = 10;

function initials(name?: string): string {
  return (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function FollowsListPage({
  type,
  source,
  userId,
  backHref,
  backLabel,
  canRemove = false,
}: {
  type: "followers" | "following";
  source: "me" | "user";
  userId?: string;
  backHref: string;
  backLabel: string;
  canRemove?: boolean;
}) {
  const [page, setPage] = useState(1);
  const removeFollower = useAdminRemoveFollower();

  const query =
    source === "me"
      ? type === "followers"
        ? useMyFollowers(page, PAGE_SIZE)
        : useMyFollowing(page, PAGE_SIZE)
      : userId
        ? type === "followers"
          ? useUserFollowers(userId, page, PAGE_SIZE)
          : useUserFollowing(userId, page, PAGE_SIZE)
        : null;

  usePageTitle(`${type} · ${backLabel}`);

  const items = query?.data?.follows ?? [];
  const total = query?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, query?.data?.pagination?.totalPages ?? 1);
  const showRemove =
    canRemove && source === "user" && type === "followers";

  const handleRemove = (follower: FollowUserData) => {
    if (!userId) return;
    removeFollower.mutate(
      { userId, followerId: follower.userId },
      {
        onSuccess: () =>
          toast.success(
            `Removed ${follower.name || follower.email} as a follower`
          ),
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to remove follower"
          ),
      }
    );
  };

  const isFollowers = type === "followers";

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="truncate">{backLabel}</span>
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold tracking-tight capitalize">
            {type}
            <Badge variant="secondary">{total}</Badge>
          </h1>
        </div>

        <div className="rounded-lg border border-border/15">
          {!query || query.isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-muted/40"
                />
              ))}
            </div>
          ) : query.isError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {query.error instanceof Error
                ? query.error.message
                : `Failed to load ${type}`}
            </div>
          ) : items.length === 0 ? (
            <div className="py-2">
              <EmptyState
                icon={isFollowers ? UserCheck : UserRound}
                title={
                  isFollowers ? "No followers yet" : "Not following anyone"
                }
                description={
                  isFollowers
                    ? source === "me"
                      ? "Follow others to get seen — your followers will show up here."
                      : "This user has no followers at the moment."
                    : source === "me"
                      ? "People you follow will show up here."
                      : "This user is not following anyone yet."
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/10">
              {items.map((person) => (
                <li
                  key={person.userId}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      {person.avatarUrl && (
                        <AvatarImage src={person.avatarUrl} alt={person.name} />
                      )}
                      <AvatarFallback>{initials(person.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {person.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person.email}
                      </p>
                    </div>
                  </div>
                  {showRemove ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={removeFollower.isPending}
                      onClick={() => handleRemove(person)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {removeFollower.isPending &&
                      removeFollower.variables?.followerId ===
                        person.userId ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {person.accountType ?? "user"}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && totalPages > 1 && (
            <div className="border-t border-border/15 px-5 py-3">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={query?.isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </AnimatedContent>
  );
}
