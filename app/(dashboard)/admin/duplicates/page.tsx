"use client";

import { useMemo, useState } from "react";
import { useDuplicateGroups, useMergeAccounts } from "@/lib/hooks/use-safety";
import type { DuplicateGroupData } from "@/lib/hooks/use-safety";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { SafetySubNav } from "@/components/admin/safety-sub-nav";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Pagination } from "@/components/shared/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GitMerge, Users } from "lucide-react";
import { toast } from "sonner";

const LINK_TYPE_STYLES: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-600",
  phone: "bg-violet-500/10 text-violet-600",
  device: "bg-cyan-500/10 text-cyan-600",
  ip: "bg-amber-500/10 text-amber-600",
};

const USER_STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  suspended: "bg-orange-500/10 text-orange-600",
  banned: "bg-red-500/10 text-red-600",
  invited: "bg-blue-500/10 text-blue-600",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDuplicatesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useDuplicateGroups({ page });
  const mergeAccounts = useMergeAccounts();

  const [selected, setSelected] = useState<DuplicateGroupData | null>(null);
  const [primaryId, setPrimaryId] = useState("");
  const [duplicateId, setDuplicateId] = useState("");

  const groups = useMemo(() => data?.groups ?? [], [data]);
  const pagination = data?.pagination;

  const openMerge = (group: DuplicateGroupData) => {
    setSelected(group);
    setPrimaryId(group.users[0]?.id ?? "");
    setDuplicateId(group.users[1]?.id ?? group.users[0]?.id ?? "");
  };

  const confirmMerge = () => {
    if (!selected || !primaryId || !duplicateId) return;
    if (primaryId === duplicateId) {
      toast.error("Primary and duplicate must be different accounts");
      return;
    }
    mergeAccounts.mutate(
      { primaryUserId: primaryId, duplicateUserId: duplicateId },
      {
        onSuccess: (res) => {
          setSelected(null);
          toast.success(`${res.email} merged into the primary account`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Merge failed");
        },
      }
    );
  };

  const userOptions = (group: DuplicateGroupData) =>
    group.users.map((u) => ({ value: u.id, label: u.email }));

  return (
    <AnimatedContent>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Duplicate accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accounts sharing the same email, phone, device, or IP that may
            represent the same person.
          </p>
        </div>

        <SafetySubNav />

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to detect duplicates"}
          </div>
        ) : (
          <>
            {groups.length === 0 ? (
              <div className="rounded-lg border bg-card">
                <EmptyState
                  icon={GitMerge}
                  title="No duplicate groups"
                  description="No accounts currently share identifying information."
                />
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={`${group.link_type}:${group.link_value}`}
                    className="rounded-lg border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Badge className={LINK_TYPE_STYLES[group.link_type]}>
                          {group.link_type.toUpperCase()}
                        </Badge>
                        <span className="font-mono text-sm font-medium">
                          {group.link_value}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {group.users.length} accounts
                        </span>
                        {group.users.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMerge(group)}
                          >
                            Merge
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 divide-y rounded-lg border">
                      {group.users.map((user) => (
                        <div
                          key={user.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <div>
                            <div className="font-medium">{user.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.id}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              Joined {formatDate(user.created_at)}
                            </span>
                            <Badge className={USER_STATUS_STYLES[user.status]}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            )}
          </>
        )}

        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Merge duplicate accounts</DialogTitle>
              <DialogDescription>
                {selected
                  ? `${selected.users.length} accounts share ${
                      selected.link_type
                    } ${selected.link_value}. The duplicate's data moves into the primary and the duplicate is deactivated.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Primary account"
                  value={primaryId}
                  onValueChange={setPrimaryId}
                  options={userOptions(selected)}
                />
                <FormSelect
                  label="Duplicate account"
                  value={duplicateId}
                  onValueChange={setDuplicateId}
                  options={userOptions(selected)}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmMerge}
                disabled={mergeAccounts.isPending}
              >
                {mergeAccounts.isPending ? "Merging..." : "Merge accounts"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedContent>
  );
}
