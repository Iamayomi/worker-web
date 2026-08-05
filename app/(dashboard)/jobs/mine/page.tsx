"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Briefcase,
  Eye,
  Pencil,
  PlusCircle,
  Trash2,
  Users,
} from "lucide-react";
import { useMyJobs, useDeleteJob } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";
import { worker } from "@/lib/api/worker";
import { buildUrl } from "@/lib/utils/build-url";
import { fetchAllPages, assertSuccess } from "@/lib/utils/export-all";
import { JOB_STATUSES } from "@/lib/constants/enums";
import { JOB_STATUS } from "@/lib/constants/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { MyJobStats } from "@/components/jobs/my-job-stats";
import { formatDate } from "@/components/jobs/job-card";
import type { Job, JobListData, JobStatus } from "@/types/api/jobs";

export default function MyJobsPage() {
  usePageTitle("My Jobs");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<JobStatus | "">("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const limit = 10;

  const { user } = useAuth();
  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  const { data, isLoading, isError, error } = useMyJobs({
    status: status || undefined,
    page,
    limit,
  });

  const deleteJob = useDeleteJob();

  if (isTalent) {
    return (
      <AnimatedContent className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="My jobs"
          description="Jobs you've posted across every status."
          backHref="/jobs"
        />
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Briefcase}
            title="Clients only"
            description="Only clients can post and manage jobs. As a talent you can browse and apply to open roles instead."
            action={
              <Button asChild>
                <Link href="/jobs">Browse jobs</Link>
              </Button>
            }
          />
        </div>
      </AnimatedContent>
    );
  }

  const jobs = data?.jobs ?? [];
  const pagination = data?.pagination;

  const mapRow = (job: Job) => [
    job.title,
    job.companyName ?? "",
    job.location,
    job.status,
    formatDate(job.expiresAt),
  ];

  const exportRows = jobs.map(mapRow);

  const fetchAllRows = async () => {
    const all = await fetchAllPages(async (p, l) => {
      const res = await worker.auth.get<JobListData>(
        buildUrl("/jobs/mine", { status: status || undefined, page: p, limit: l })
      );
      assertSuccess(res);
      return {
        items: res.data!.jobs,
        total: res.data!.pagination.total,
      };
    });
    return all.map(mapRow);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteJob.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Job deleted");
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete job");
      },
    });
  };

  const filterTabs = [
    { value: "", label: "All" },
    ...JOB_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ];

  return (
    <AnimatedContent className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="My jobs"
        description="Jobs you've posted across every status."
        actions={
          <div className="flex items-center gap-2">
            <ExportCsvButton
              filename={`my-jobs-${new Date().toISOString().slice(0, 10)}.csv`}
              headers={["Job", "Company", "Location", "Status", "Closes"]}
              rows={exportRows}
              fetchAll={fetchAllRows}
            />
            <Button asChild>
              <Link href="/dashboard/jobs/new">
                <PlusCircle className="h-4 w-4" />
                Post a job
              </Link>
            </Button>
          </div>
        }
      />

      <MyJobStats />

      <div className="flex flex-wrap gap-1.5">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={status === tab.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setStatus(tab.value as JobStatus | "");
              setPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isError && <ErrorAlert message={error instanceof Error ? error.message : "Failed to load jobs"} />}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-border/15 bg-muted" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Post your first job to start receiving applications."
            action={
              <Button asChild>
                <Link href="/dashboard/jobs/new">
                  <PlusCircle className="h-4 w-4" />
                  Post a job
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/15 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/jobs/mine/${job.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {job.title}
                  </Link>
                  <Badge className={JOB_STATUS[job.status] ?? undefined}>
                    {job.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {job.companyName ?? "Your company"} · {job.location} · Closes{" "}
                  {formatDate(job.expiresAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/jobs/mine/${job.id}`}>
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/jobs/manage/${job.id}/applications`}>
                    <Users className="h-4 w-4" />
                    Applicants
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/jobs/manage/${job.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this job?"
        message="This will permanently remove the job listing and its applications."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </AnimatedContent>
  );
}
