"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAllReferrals,
  useUpdateReferralStatus,
  type ReferralStatusValue,
} from "@/lib/hooks/use-referral";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants/enums";
import { AccountType, UserRole } from "@/types/api/auth";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ReferralSubNav } from "@/components/referral/referral-sub-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
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
import {
  Gift,
  Clock,
  Link2,
  CheckCircle2,
  XCircle,
  Eye,
  MoreVertical,
  Ban,
  RotateCcw,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.TALENT, label: "Talent" },
  { value: AccountType.CLIENT, label: "Client" },
  { value: AccountType.ADMIN, label: "Admin" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  active: "bg-green-500/10 text-green-600",
  completed: "bg-blue-500/10 text-blue-600",
  cancelled: "bg-red-500/10 text-red-600",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function ManageReferralsPage() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).includes(UserRole.SUPER_ADMIN) ||
      (user?.roles ?? []).includes(UserRole.ADMIN),
    [user]
  );
  const isSuperAdmin = useMemo(
    () => (user?.roles ?? []).includes(UserRole.SUPER_ADMIN),
    [user]
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [accountType, setAccountType] = useState<AccountType | "all">("all");

  const limit = 20;
  const { data, isLoading, isError, error } = useAllReferrals({
    page,
    limit,
    status: status === "all" ? undefined : status,
    accountType: accountType === "all" ? undefined : accountType,
    partnerEmail: partnerEmail || undefined,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setPartnerEmail(search.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  if (!isAdmin) {
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

  const referrals = data?.referrals ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const updateStatus = useUpdateReferralStatus();

  const changeStatus = (id: string, status: ReferralStatusValue) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Referral marked ${status}`),
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to update referral"
          ),
      }
    );
  };

  return (
    <AnimatedContent className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Manage referrals"
        description="View and manage referrals across all partners."
      />

      <ReferralSubNav />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total referrals" value={stats.total} icon={Gift} />
          <StatCard
            label="Pending"
            value={stats.byStatus.pending ?? 0}
            icon={Clock}
          />
          <StatCard
            label="Active"
            value={stats.byStatus.active ?? 0}
            icon={Link2}
          />
          <StatCard
            label="Completed"
            value={stats.byStatus.completed ?? 0}
            icon={CheckCircle2}
          />
          <StatCard
            label="Cancelled"
            value={stats.byStatus.cancelled ?? 0}
            icon={XCircle}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search partner email..."
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
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
          {error instanceof Error ? error.message : "Failed to load referrals"}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : referrals.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Gift}
            title="No referrals found"
            description="Try a different search term or filter."
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/15">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border/15 bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Partner</th>
                <th className="px-4 py-3 font-medium">Referred</th>
                <th className="px-4 py-3 font-medium">Account type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r, index) => (
                <tr
                  key={r.id}
                  className="border-b border-border/10 last:border-0"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {String((page - 1) * limit + index + 1).padStart(2, "0")}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium">
                    {r.partner_email ?? "—"}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                    {r.referred_email}
                  </td>
                  <td className="px-4 py-3">
                    {r.referred_account_type ? (
                      <Badge variant="secondary" className="text-xs">
                        {ACCOUNT_TYPE_LABELS[r.referred_account_type as AccountType] ??
                          r.referred_account_type}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_STYLES[r.status] ?? undefined}>
                      {r.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.commission && Number(r.commission) > 0
                      ? `$${Number(r.commission).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isSuperAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${r.referred_email}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {r.referred_user_id && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${r.referred_user_id}`}>
                                  <Eye className="h-4 w-4" /> View user
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {r.status !== "pending" && (
                            <DropdownMenuItem
                              onSelect={() => changeStatus(r.id, "pending")}
                            >
                              <RotateCcw className="h-4 w-4" /> Set pending
                            </DropdownMenuItem>
                          )}
                          {r.status !== "active" && (
                            <DropdownMenuItem
                              onSelect={() => changeStatus(r.id, "active")}
                            >
                              <PlayCircle className="h-4 w-4" /> Mark active
                            </DropdownMenuItem>
                          )}
                          {r.status !== "completed" && (
                            <DropdownMenuItem
                              onSelect={() => changeStatus(r.id, "completed")}
                            >
                              <CheckCircle2 className="h-4 w-4" /> Mark completed
                            </DropdownMenuItem>
                          )}
                          {r.status !== "cancelled" && (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => changeStatus(r.id, "cancelled")}
                            >
                              <Ban className="h-4 w-4" /> Cancel referral
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}
    </AnimatedContent>
  );
}
