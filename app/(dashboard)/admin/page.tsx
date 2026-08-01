"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAllUsers,
  useDeleteUser,
  useReviewClientVerification,
} from "@/lib/hooks/use-users";
import { ROLE_LABELS } from "@/lib/constants/enums";
import type { UserRole } from "@/types/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldX,
  Trash2,
  Users,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-yellow-500/10 text-yellow-600",
  active: "bg-green-500/10 text-green-600",
  pending_verification: "bg-blue-500/10 text-blue-600",
  suspended: "bg-red-500/10 text-red-600",
  blocked: "bg-red-500/10 text-red-600",
};

const VERIFICATION_STYLES: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-600",
  rejected: "bg-red-500/10 text-red-600",
};

interface AdminUser {
  id: string;
  email: string;
  status: string;
  roles: string[];
  email_verified: boolean;
  verification_status?: string;
  created_at: string;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const isSuperAdmin = useMemo(
    () => (user?.roles ?? []).includes("super_admin"),
    [user]
  );

  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const limit = 20;
  const { data, isLoading, isError, error, refetch } = useAllUsers({
    page,
    limit,
    email: email || undefined,
  });
  const removeUser = useDeleteUser();
  const reviewVerification = useReviewClientVerification();

  const users: AdminUser[] = data?.users ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setEmail(search.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const canManage = isSuperAdmin;

  if (!canManage && !(user?.roles ?? []).includes("admin")) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            You need an admin role to view this page.
          </div>
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage all registered users.
            </p>
          </div>
          {!canManage && (
            <Badge variant="secondary">
              <ShieldCheck className="h-3.5 w-3.5" /> View only
            </Badge>
          )}
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by email..."
          />
        </div>

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load users"}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-border/15">
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try a different search term."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/15 bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Verification</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/10 last:border-0">
                    <td className="max-w-[240px] truncate px-4 py-3 font-medium">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[200px] flex-wrap gap-1">
                        {u.roles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {ROLE_LABELS[role as UserRole] ?? role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_STYLES[u.status] ?? undefined}>
                        {u.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.verification_status === "verified" ? (
                        <VerifiedBadge />
                      ) : u.verification_status ? (
                        <Badge
                          className={
                            VERIFICATION_STYLES[u.verification_status] ??
                            undefined
                          }
                        >
                          {u.verification_status.replace(/_/g, " ")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.email_verified ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(u.created_at)}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.verification_status !== "verified" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Verify ${u.email}`}
                              disabled={reviewVerification.isPending}
                              onClick={() =>
                                reviewVerification.mutate({
                                  userId: u.id,
                                  decision: "verified",
                                })
                              }
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {u.verification_status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Reject ${u.email}`}
                              disabled={reviewVerification.isPending}
                              onClick={() =>
                                reviewVerification.mutate({
                                  userId: u.id,
                                  decision: "rejected",
                                })
                              }
                            >
                              <ShieldX className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${u.email}`}
                            disabled={removeUser.isPending}
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevious || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          removeUser.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
            onSettled: () => refetch(),
          });
        }}
        title="Delete user?"
        description={`This will permanently remove ${deleteTarget?.email ?? "this user"}'s access. This action cannot be undone.`}
        isLoading={removeUser.isPending}
      />
    </AnimatedContent>
  );
}
