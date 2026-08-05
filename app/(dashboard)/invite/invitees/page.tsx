"use client";

import { useMemo, useState } from "react";
import { useInvitees, useSuspendUser, useActivateUser, useDeleteUser, type InviteesData } from "@/lib/hooks/use-users";
import { worker } from "@/lib/api/worker";
import { fetchAllPages, assertSuccess } from "@/lib/utils/export-all";
import { ROLE_LABELS, ACCOUNT_TYPE_LABELS } from "@/lib/constants/enums";
import type { User, UserRole } from "@/types/api/auth";
import { AccountType } from "@/types/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Mail, UserCheck, Clock, Ban, CheckCircle2, Trash2, MoreVertical, Eye } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { TableSkeleton } from "@/components/shared/skeletons";
import { DeleteModal } from "@/components/ui/delete-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteSubNav } from "@/components/invite/invite-sub-nav";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-yellow-500/10 text-yellow-600",
  active: "bg-green-500/10 text-green-600",
  pending_verification: "bg-blue-500/10 text-blue-600",
  suspended: "bg-red-500/10 text-red-600",
  blocked: "bg-red-500/10 text-red-600",
};

const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.TALENT, label: "Talent" },
  { value: AccountType.CLIENT, label: "Client" },
  { value: AccountType.ADMIN, label: "Admin" },
];

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function MyInviteesPage() {
  const { user } = useAuth();
  const isSuperAdmin = useMemo(
    () => (user?.roles ?? []).includes("super_admin"),
    [user]
  );

  const [page, setPage] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useInvitees({
    page,
    limit,
    accountType,
  });

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const removeUser = useDeleteUser();

  const invitees: User[] = data?.invitees ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const mapRow = (invitee: User) => [
    invitee.email,
    invitee.accountType
      ? ACCOUNT_TYPE_LABELS[invitee.accountType] ?? invitee.accountType
      : "",
    invitee.roles.join(", "),
    invitee.status.replace(/_/g, " "),
    formatDate(invitee.invitedAt),
  ];

  const exportRows = invitees.map(mapRow);

  const normalizeRoles = (roles: string | string[] | null | undefined) => {
    if (Array.isArray(roles)) return roles;
    if (typeof roles === "string" && roles.trim())
      return roles
        .trim()
        .replace(/^\{|\}$/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return [];
  };

  const fetchAllRows = async () => {
    const all = await fetchAllPages(async (p, l) => {
      const params = new URLSearchParams({ page: String(p), limit: String(l) });
      if (accountType !== "all") params.set("accountType", accountType);
      const res = await worker.auth.get<InviteesData>(
        `/users/me/invitees?${params}`
      );
      assertSuccess(res);
      return {
        items: (res.data!.invitees ?? []).map((u) => ({
          ...u,
          roles: normalizeRoles(u.roles as unknown as string | string[]) as UserRole[],
        })),
        total: res.data!.pagination.total,
      };
    });
    return all.map(mapRow);
  };

  const handleSuspend = () => {
    if (!suspendTarget) return;
    suspendUser.mutate(
      { userId: suspendTarget.id },
      {
        onSuccess: () => {
          toast.success("Invitee suspended");
          setSuspendTarget(null);
        },
        onSettled: () => refetch(),
      }
    );
  };

  return (
    <AnimatedContent className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="My invitees"
        description="People you've invited to join the platform."
        actions={
          <div className="flex items-center gap-2">
            <ExportCsvButton
              filename={`my-invitees-${new Date().toISOString().slice(0, 10)}.csv`}
              headers={["Email", "Account type", "Roles", "Status", "Invited"]}
              rows={exportRows}
              fetchAll={fetchAllRows}
            />
            <Button asChild>
              <Link href="/invite">
                <UserPlus className="h-4 w-4" />
                Invite user
              </Link>
            </Button>
          </div>
        }
      />

      <InviteSubNav />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total invitees" value={stats.total} icon={Users} />
          <StatCard
            label="Invited"
            value={stats.byStatus.invited ?? 0}
            icon={Mail}
          />
          <StatCard
            label="Active"
            value={stats.byStatus.active ?? 0}
            icon={UserCheck}
          />
          <StatCard
            label="Pending verification"
            value={stats.byStatus.pending_verification ?? 0}
            icon={Clock}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={accountType}
          onValueChange={(v) => {
            setAccountType(v as AccountType | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {ACCOUNT_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load invitees"}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : invitees.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Users}
            title="No invitees yet"
            description="When you invite someone, they'll show up here."
            action={
              <Button asChild>
                <Link href="/invite">
                  <UserPlus className="h-4 w-4" />
                  Invite user
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {invitees.map((invitee) => (
            <div
              key={invitee.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/15 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{invitee.email}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {invitee.accountType
                    ? ACCOUNT_TYPE_LABELS[invitee.accountType] ?? invitee.accountType
                    : ""}{" "}
                  · Invited {formatDate(invitee.invitedAt)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {invitee.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="text-xs"
                    >
                      {ROLE_LABELS[role as UserRole] ?? role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge className={STATUS_STYLES[invitee.status] ?? undefined}>
                  {invitee.status.replace(/_/g, " ")}
                </Badge>
                {isSuperAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${invitee.email}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${invitee.id}`}>
                          <Eye className="h-4 w-4" /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {invitee.status === "suspended" ? (
                        <DropdownMenuItem
                          onSelect={() =>
                            activateUser.mutate(invitee.id, {
                              onSettled: () => refetch(),
                            })
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" /> Activate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setSuspendTarget(invitee)}
                        >
                          <Ban className="h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteTarget(invitee)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}

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
        title="Delete invitee?"
        description={`This will permanently remove ${deleteTarget?.email ?? "this invitee"}'s access. This action cannot be undone.`}
        isLoading={removeUser.isPending}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) setSuspendTarget(null);
        }}
        onConfirm={handleSuspend}
        title="Suspend invitee?"
        message={`${suspendTarget?.email ?? "This invitee"} will lose access until reactivated.`}
        confirmLabel="Suspend"
        destructive
      />
    </AnimatedContent>
  );
}
