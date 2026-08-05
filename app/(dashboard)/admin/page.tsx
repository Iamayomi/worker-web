"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAllUsers,
  useDeleteUser,
  useReviewClientVerification,
  useSuspendUser,
  useActivateUser,
} from "@/lib/hooks/use-users";
import { ROLE_LABELS } from "@/lib/constants/enums";
import { AccountType, UserStatus, UserRole } from "@/types/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
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
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { AdminTotals } from "@/components/admin/admin-totals";
import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { worker } from "@/lib/api/worker";
import { fetchAllPages, assertSuccess } from "@/lib/utils/export-all";
import type { UsersListData } from "@/lib/hooks/use-users";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Ban,
  CheckCircle2,
  Eye,
  MoreVertical,
  ShieldCheck,
  ShieldX,
  Trash2,
  Users,
  UserPlus,
  UserCog,
} from "lucide-react";
import Link from "next/link";

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

const STATUS_OPTIONS = [
  { value: UserStatus.ACTIVE, label: "Active" },
  { value: UserStatus.INVITED, label: "Invited" },
  { value: UserStatus.PENDING_VERIFICATION, label: "Pending verification" },
  { value: UserStatus.SUSPENDED, label: "Suspended" },
  { value: UserStatus.BLOCKED, label: "Blocked" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.TALENT, label: "Talent" },
  { value: AccountType.CLIENT, label: "Client" },
  { value: AccountType.ADMIN, label: "Admin" },
];

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
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const searchParams = useSearchParams();
  const urlAccountType = searchParams.get("accountType") as
    | AccountType
    | null;
  const [accountType, setAccountType] = useState<AccountType | "all">(
    urlAccountType ?? "all"
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);

  const limit = 20;
  const { data, isLoading, isError, error, refetch } = useAllUsers({
    page,
    limit,
    email: email || undefined,
    status: status === "all" ? undefined : status,
    accountType: accountType === "all" ? undefined : accountType,
  });
  const removeUser = useDeleteUser();
  const reviewVerification = useReviewClientVerification();
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

  const users: AdminUser[] = data?.users ?? [];
  const pagination = data?.pagination;

  const mapRow = (u: AdminUser) => [
    u.email,
    u.roles.join(", "),
    u.status.replace(/_/g, " "),
    u.verification_status ? u.verification_status.replace(/_/g, " ") : "",
    u.email_verified ? "Yes" : "No",
    formatDate(u.created_at),
  ];

  const exportRows = users.map(mapRow);

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
      if (email.trim()) params.set("email", email.trim());
      if (status !== "all") params.set("status", status);
      if (accountType !== "all") params.set("accountType", accountType);
      const res = await worker.auth.get<UsersListData>(`/users?${params}`);
      assertSuccess(res);
      return {
        items: (res.data!.users ?? []).map((u) => ({
          ...u,
          roles: normalizeRoles(u.roles),
        })),
        total: res.data!.pagination.total,
      };
    });
    return all.map(mapRow);
  };

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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage all registered users.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportCsvButton
              filename={`users-${new Date().toISOString().slice(0, 10)}.csv`}
              headers={["Email", "Roles", "Status", "Verification", "Verified", "Joined"]}
              rows={exportRows}
              fetchAll={fetchAllRows}
            />
            <Button asChild>
              <Link href="/invite">
                <UserPlus className="h-4 w-4" />
                Invite user
              </Link>
            </Button>
            {!canManage && (
              <Badge variant="secondary">
                <ShieldCheck className="h-3.5 w-3.5" /> View only
              </Badge>
            )}
          </div>
        </div>

        <AdminSubNav />

        <AdminTotals />

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by email..."
            />
          </div>
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
            {error instanceof Error ? error.message : "Failed to load users"}
          </div>
        )}

        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-border/15">
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try a different search term."
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/15">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border/15 bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Verification</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id} className="border-b border-border/10 last:border-0">
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
                        <span className="truncate font-medium">{u.email}</span>
                      </div>
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
                          {canManage && (
                            <DropdownMenuItem onSelect={() => setEditTarget(u)}>
                              <UserCog className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          )}
                          {canManage && (
                            <>
                              {u.verification_status !== "verified" && (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    reviewVerification.mutate({
                                      userId: u.id,
                                      decision: "verified",
                                    })
                                  }
                                >
                                  <ShieldCheck className="h-4 w-4" /> Verify
                                </DropdownMenuItem>
                              )}
                              {u.verification_status === "pending" && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() =>
                                    reviewVerification.mutate({
                                      userId: u.id,
                                      decision: "rejected",
                                    })
                                  }
                                >
                                  <ShieldX className="h-4 w-4" /> Reject
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {canManage && (
                            <>
                              <DropdownMenuSeparator />
                              {u.status === "suspended" ? (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    activateUser.mutate(u.id)
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
        title="Delete user?"
        description={`This will permanently remove ${deleteTarget?.email ?? "this user"}'s access. This action cannot be undone.`}
        isLoading={removeUser.isPending}
      />

      <EditUserModal
        user={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) setSuspendTarget(null);
        }}
        onConfirm={() => {
          if (!suspendTarget) return;
          suspendUser.mutate(
            { userId: suspendTarget.id },
            {
              onSuccess: () => setSuspendTarget(null),
              onSettled: () => refetch(),
            }
          );
        }}
        title="Suspend user?"
        message={`${suspendTarget?.email ?? "This user"} will lose access until reactivated.`}
        confirmLabel="Suspend"
        destructive
      />
    </AnimatedContent>
  );
}
