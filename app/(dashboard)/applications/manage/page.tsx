"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAllApplications,
  useDeleteApplicationAdmin,
  type AdminApplicationRow,
  type AllApplicationsData,
} from "@/lib/hooks/use-jobs";
import { worker } from "@/lib/api/worker";
import { fetchAllPages, assertSuccess } from "@/lib/utils/export-all";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants/enums";
import { APPLICATION_STATUS } from "@/lib/constants/status";
import { AccountType, UserRole } from "@/types/api/auth";
import { ApplicationStatus } from "@/types/api/jobs";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { AdminApplicationStats } from "@/components/applications/admin-application-stats";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";
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
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import {
  Eye,
  FileText,
  MoreVertical,
  Trash2,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: ApplicationStatus.APPLIED, label: "Applied" },
  { value: ApplicationStatus.UNDER_REVIEW, label: "Under review" },
  { value: ApplicationStatus.SHORTLISTED, label: "Shortlisted" },
  { value: ApplicationStatus.INTERVIEW, label: "Interview" },
  { value: ApplicationStatus.OFFERED, label: "Offered" },
  { value: ApplicationStatus.ACCEPTED, label: "Accepted" },
  { value: ApplicationStatus.REJECTED, label: "Rejected" },
  { value: ApplicationStatus.WITHDRAWN, label: "Withdrawn" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.TALENT, label: "Talent" },
  { value: AccountType.CLIENT, label: "Client" },
  { value: AccountType.ADMIN, label: "Admin" },
];

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function ManageApplicationsPage() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).includes(UserRole.SUPER_ADMIN) ||
      (user?.roles ?? []).includes(UserRole.ADMIN),
    [user]
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [accountType, setAccountType] = useState<AccountType | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminApplicationRow | null>(null);

  const limit = 20;
  const { data, isLoading, isError, error, refetch } = useAllApplications({
    page,
    limit,
    status,
    accountType,
    query: query || undefined,
  });
  const deleteApplication = useDeleteApplicationAdmin();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
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

  const applications: AdminApplicationRow[] = data?.applications ?? [];
  const pagination = data?.pagination;

  const mapRow = (app: AdminApplicationRow) => [
    app.jobTitle,
    app.applicantEmail ?? "",
    app.applicantAccountType ?? "",
    app.companyName ?? "",
    app.status,
    app.proposedRate && Number(app.proposedRate) > 0
      ? `${app.currency ?? ""} ${app.proposedRate}`.trim()
      : "",
    formatDate(app.createdAt),
  ];

  const exportRows = applications.map(mapRow);

  const fetchAllRows = async () => {
    const all = await fetchAllPages(async (p, l) => {
      const params = new URLSearchParams({ page: String(p), limit: String(l) });
      if (status !== "all") params.set("status", status);
      if (accountType !== "all") params.set("accountType", accountType);
      if (query.trim()) params.set("query", query.trim());
      const res = await worker.auth.get<AllApplicationsData>(
        `/applications/admin/all?${params}`
      );
      assertSuccess(res);
      return {
        items: res.data!.applications,
        total: res.data!.pagination.total,
      };
    });
    return all.map(mapRow);
  };

  return (
    <AnimatedContent className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Manage applications"
        description="View and manage applications across all jobs."
        actions={
          <ExportCsvButton
            filename={`applications-${new Date().toISOString().slice(0, 10)}.csv`}
            headers={["Job", "Applicant", "Account type", "Company", "Status", "Proposed rate", "Applied"]}
            rows={exportRows}
            fetchAll={fetchAllRows}
          />
        }
      />

      <AdminApplicationStats stats={data?.stats} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search job, applicant or company..."
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
          {error instanceof Error
            ? error.message
            : "Failed to load applications"}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : applications.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={FileText}
            title="No applications found"
            description="Try a different search term or filter."
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/15">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border/15 bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Account type</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Proposed rate</th>
                <th className="px-4 py-3 font-medium">Applied</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr
                  key={app.id}
                  className="border-b border-border/10 last:border-0"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {String((page - 1) * limit + index + 1).padStart(2, "0")}
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <Link
                      href={`/jobs/manage/${app.jobId}`}
                      className="truncate font-medium hover:text-primary"
                    >
                      {app.jobTitle}
                    </Link>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                    {app.applicantEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {app.applicantAccountType ? (
                      <Badge variant="secondary" className="text-xs">
                        {ACCOUNT_TYPE_LABELS[app.applicantAccountType as AccountType] ??
                          app.applicantAccountType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">
                    {app.companyName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={APPLICATION_STATUS[app.status] ?? undefined}
                    >
                      {app.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {app.proposedRate && Number(app.proposedRate) > 0
                      ? `${app.currency ?? ""} ${Number(app.proposedRate).toLocaleString()}`.trim()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${app.applicantEmail ?? "application"}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/applications/${app.id}`}>
                            <Eye className="h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeleteTarget(app)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
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

      <DeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteApplication.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
            onSettled: () => refetch(),
          });
        }}
        title="Delete application?"
        description={`This will permanently remove the application from ${deleteTarget?.applicantEmail ?? "this applicant"}. This action cannot be undone.`}
        isLoading={deleteApplication.isPending}
      />
    </AnimatedContent>
  );
}
