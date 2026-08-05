"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAdminInvites,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
  type InviteesData,
} from "@/lib/hooks/use-users";
import { worker } from "@/lib/api/worker";
import { fetchAllPages, assertSuccess } from "@/lib/utils/export-all";
import { ROLE_LABELS, ACCOUNT_TYPE_LABELS } from "@/lib/constants/enums";
import { AccountType, UserStatus, UserRole } from "@/types/api/auth";
import type { User } from "@/types/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Ban,
  CheckCircle2,
  Eye,
  Mail,
  MoreVertical,
  Trash2,
  UserCheck,
  Users,
  UserPlus,
  Building2,
  HardHat,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-yellow-500/10 text-yellow-600",
  active: "bg-green-500/10 text-green-600",
  pending_verification: "bg-blue-500/10 text-blue-600",
  suspended: "bg-red-500/10 text-red-600",
  blocked: "bg-red-500/10 text-red-600",
};

const STATUS_OPTIONS = [
  { value: UserStatus.ACTIVE, label: "Active" },
  { value: UserStatus.INVITED, label: "Invited" },
  { value: UserStatus.PENDING_VERIFICATION, label: "Pending verification" },
  { value: UserStatus.SUSPENDED, label: "Suspended" },
  { value: UserStatus.BLOCKED, label: "Blocked" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.TALENT, label: "Talent", icon: HardHat },
  { value: AccountType.CLIENT, label: "Client", icon: Building2 },
  { value: AccountType.ADMIN, label: "Admin", icon: ShieldCheck },
];

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminInvitesPage() {
  const { user } = useAuth();
  const isSuperAdmin = useMemo(
    () => (user?.roles ?? []).includes("super_admin"),
    [user]
  );

  const [page, setPage] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [inviter, setInviter] = useState("");
  const [inviterInput, setInviterInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const limit = 20;

  const { data, isLoading, isError, error, refetch } = useAdminInvites({
    page,
    limit,
    accountType,
    status,
    invitedByEmail: inviter || undefined,
  });

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const removeUser = useDeleteUser();

  const invitees: User[] = data?.invitees ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const mapRow = (u: User) => [
    u.email,
    u.accountType ? ACCOUNT_TYPE_LABELS[u.accountType] ?? u.accountType : "",
    u.roles.join(", "),
    u.status.replace(/_/g, " "),
    u.invitedByEmail ?? "",
    formatDate(u.invitedAt),
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
      if (status !== "all") params.set("status", status);
      if (inviter.trim()) params.set("invitedByEmail", inviter.trim());
      const res = await worker.auth.get<InviteesData>(
        `/users/invites?${params}`
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setInviter(inviterInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [inviterInput]);

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

  if (!isSuperAdmin && !(user?.roles ?? []).includes("admin")) {
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Invites management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage every invitation sent across the platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportCsvButton
              filename={`invites-${new Date().toISOString().slice(0, 10)}.csv`}
              headers={["Email", "Account type", "Roles", "Status", "Invited by", "Invited"]}
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
        </div>

        <AdminSubNav />

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total invites" value={stats.total} icon={Users} />
            <StatCard
              label="Talent invites"
              value={stats.byAccountType.talent ?? 0}
              icon={HardHat}
            />
            <StatCard
              label="Client invites"
              value={stats.byAccountType.client ?? 0}
              icon={Building2}
            />
            <StatCard
              label="Admin invites"
              value={stats.byAccountType.admin ?? 0}
              icon={ShieldCheck}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              value={inviterInput}
              onChange={setInviterInput}
              placeholder="Search by inviter email..."
            />
          </div>
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
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as UserStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load invites"}
          </div>
        )}

        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : invitees.length === 0 ? (
          <div className="rounded-lg border border-border/15">
            <EmptyState
              icon={Mail}
              title="No invites found"
              description="Try a different filter or invite someone to get started."
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/15">
            <table className="w-full min-w-[840px] text-sm">
              <thead>
                <tr className="border-b border-border/15 bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Invitee</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Invited by</th>
                  <th className="px-4 py-3 font-medium">Invited</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitees.map((u, index) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/10 last:border-0"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {String((page - 1) * limit + index + 1).padStart(2, "0")}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="text-xs font-semibold">
                            {u.email.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {ACCOUNT_TYPE_LABELS[u.accountType] ??
                              u.accountType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[200px] flex-wrap gap-1">
                        {u.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="text-xs"
                          >
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
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                      {u.invitedByEmail ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(u.invitedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${u.email}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${u.id}`}>
                              <Eye className="h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          {isSuperAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              {u.status === "suspended" ? (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    activateUser.mutate(u.id, {
                                      onSettled: () => refetch(),
                                    })
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" /> Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setSuspendTarget(u)}
                                >
                                  <Ban className="h-4 w-4" /> Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setDeleteTarget(u)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
