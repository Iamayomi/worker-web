"use client";

import { useMemo, useState } from "react";
import { useBlockedUsers, useUnblockUser } from "@/lib/hooks/use-safety";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Ban, Inbox } from "lucide-react";
import type { BlockData } from "@/lib/hooks/use-safety";

function initials(email?: string): string {
  const source = email ?? "?";
  return source
    .split(/[@.]/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlockedUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useBlockedUsers({ page });
  const unblock = useUnblockUser();

  const [toUnblock, setToUnblock] = useState<BlockData | null>(null);

  const blocks = useMemo(() => data?.blocks ?? [], [data]);
  const pagination = data?.pagination;

  const confirmUnblock = () => {
    if (!toUnblock) return;
    unblock.mutate(toUnblock.blocked_id, {
      onSuccess: () => setToUnblock(null),
    });
  };

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blocked users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Users you&apos;ve blocked can&apos;t message you. Unblock anytime.
          </p>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load blocked users"}
          </div>
        ) : blocks.length === 0 ? (
          <div className="rounded-lg border bg-card">
            <EmptyState
              icon={Ban}
              title="No blocked users"
              description="You haven't blocked anyone yet."
            />
          </div>
        ) : (
          <>
            <div className="divide-y rounded-lg border bg-card">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-4 p-4"
                >
                  <Avatar className="size-10">
                    <AvatarFallback>{initials(block.blocked_email)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {block.blocked_email ?? block.blocked_id}
                    </p>
                    {block.reason && (
                      <p className="truncate text-xs text-muted-foreground">
                        {block.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Blocked on {formatDate(block.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setToUnblock(block)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevious}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <DeleteModal
          open={!!toUnblock}
          onOpenChange={(open) => !open && setToUnblock(null)}
          onConfirm={confirmUnblock}
          title="Unblock user"
          description={
            toUnblock
              ? `This will let ${toUnblock.blocked_email ?? "this user"} message you again.`
              : ""
          }
          isLoading={unblock.isPending}
        />
      </div>
    </AnimatedContent>
  );
}
