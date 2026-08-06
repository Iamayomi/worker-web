"use client";

import { useMemo, useState } from "react";
import { useAllBlocks, useRemoveBlock } from "@/lib/hooks/use-safety";
import { Button } from "@/components/ui/button";
import { SafetySubNav } from "@/components/admin/safety-sub-nav";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Inbox, Trash2 } from "lucide-react";
import type { BlockData } from "@/lib/hooks/use-safety";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBlocksPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAllBlocks({ page });
  const removeBlock = useRemoveBlock();

  const [toRemove, setToRemove] = useState<BlockData | null>(null);

  const blocks = useMemo(() => data?.blocks ?? [], [data]);
  const pagination = data?.pagination;

  const confirmRemove = () => {
    if (!toRemove) return;
    removeBlock.mutate(toRemove.id, {
      onSuccess: () => setToRemove(null),
    });
  };

  return (
    <AnimatedContent>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blocked users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All user blocks across the platform. Remove blocks here if needed.
          </p>
        </div>

        <SafetySubNav />

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load blocks"}
          </div>
        ) : blocks.length === 0 ? (
          <div className="rounded-lg border bg-card">
            <EmptyState
              icon={Inbox}
              title="No blocks"
              description="There are no user blocks to show right now."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Blocker</th>
                    <th className="px-4 py-3">Blocked</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {blocks.map((block) => (
                    <tr key={block.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <div className="font-medium">{block.blocker_email ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {block.blocker_id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{block.blocked_email ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {block.blocked_id}
                        </div>
                      </td>
                      <td className="max-w-[240px] px-4 py-3">
                        <span className="line-clamp-2 text-muted-foreground">
                          {block.reason ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(block.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setToRemove(block)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          open={!!toRemove}
          onOpenChange={(open) => !open && setToRemove(null)}
          onConfirm={confirmRemove}
          title="Remove block"
          description={
            toRemove
              ? `This will unblock ${toRemove.blocked_email ?? "the blocked user"}. They will be able to message ${toRemove.blocker_email ?? "the blocker"} again.`
              : ""
          }
          isLoading={removeBlock.isPending}
        />
      </div>
    </AnimatedContent>
  );
}
