"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAllJobs,
  useDeleteJobAdmin,
  type AdminJobRow,
  type AllJobsData,
} from "@/lib/hooks/use-jobs";
import { worker } from "@/lib/api/worker";
import { fetchAllPages, assertSuccess } from "@/lib/utils/export-all";
import { JobStatus } from "@/types/api/jobs";
import { UserRole } from "@/types/api/auth";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { AdminJobTotals } from "@/components/jobs/admin-job-totals";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
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
import { Briefcase, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: JobStatus.DRAFT, label: "Draft" },
  { value: JobStatus.PUBLISHED, label: "Published" },
  { value: JobStatus.CLOSED, label: "Closed" },
  { value: JobStatus.FILLED, label: "Filled" },
  { value: JobStatus.EXPIRED, label: "Expired" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600",
  published: "bg-green-500/10 text-green-600",
  closed: "bg-gray-500/10 text-gray-600",
  filled: "bg-blue-500/10 text-blue-600",
  expired: "bg-red-500/10 text-red-600",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatSalary(row: AdminJobRow) {
  if (row.salaryMin == null && row.salaryMax == null) return "—";
  const currency = row.currency ?? "";
  const min = row.salaryMin != null ? `$${Number(row.salaryMin).toLocaleString()}` : "";
  const max = row.salaryMax != null ? `$${Number(row.salaryMax).toLocaleString()}` : "";
  if (min && max) return `${currency} ${min} - ${max}`.trim();
  return `${currency} ${min || max}`.trim();
}

export default function ManageJobsPage() {
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
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminJobRow | null>(null);

  const limit = 20;
  const { data, isLoading, isError, error, refetch } = useAllJobs({
    page,
    limit,
    query: query || undefined,
    status,
  });
  const deleteJob = useDeleteJobAdmin();

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

  const jobs: AdminJobRow[] = data?.jobs ?? [];
  const pagination = data?.pagination;

  const mapRow = (job: AdminJobRow) => [
    job.title,
    job.companyName ?? "",
    job.clientEmail ?? "",
    job.applicationsCount,
    job.status,
    formatSalary(job),
    formatDate(job.createdAt),
  ];

  const exportRows = jobs.map(mapRow);

  const fetchAllRows = async () => {
    const all = await fetchAllPages(async (p, l) => {
      const params = new URLSearchParams({ page: String(p), limit: String(l) });
      if (query.trim()) params.set("query", query.trim());
      if (status !== "all") params.set("status", status);
      const res = await worker.auth.get<AllJobsData>(
        `/jobs/admin/all?${params}`
      );
      assertSuccess(res);
      return {
        items: res.data!.jobs,
        total: res.data!.pagination.total,
      };
    });
    return all.map(mapRow);
  };

  return (
    <AnimatedContent className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Manage jobs"
        description="View and manage job postings across all clients."
        actions={
          <ExportCsvButton
            filename={`jobs-${new Date().toISOString().slice(0, 10)}.csv`}
            headers={["Job", "Company", "Owner", "Applications", "Status", "Salary", "Posted"]}
            rows={exportRows}
            fetchAll={fetchAllRows}
          />
        }
      />

      <AdminJobTotals />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search title, company or email..."
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as JobStatus | "all");
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
          {error instanceof Error ? error.message : "Failed to load jobs"}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
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
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Applications</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Salary</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr
                  key={job.id}
                  className="border-b border-border/10 last:border-0"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {String((page - 1) * limit + index + 1).padStart(2, "0")}
                  </td>
                  <td className="max-w-[260px] px-4 py-3">
                    <p className="truncate font-medium">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.companyName ?? "—"}
                    </p>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                    {job.clientEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job.applicationsCount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_STYLES[job.status] ?? undefined}>
                      {job.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSalary(job)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${job.title}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/jobs/manage/${job.id}`}>
                            <Eye className="h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/jobs/manage/${job.id}/edit`}>
                            <Pencil className="h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeleteTarget(job)}
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
          deleteJob.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
            onSettled: () => refetch(),
          });
        }}
        title="Delete job?"
        description={`This will permanently remove "${deleteTarget?.title ?? "this job"}". This action cannot be undone.`}
        isLoading={deleteJob.isPending}
      />
    </AnimatedContent>
  );
}
