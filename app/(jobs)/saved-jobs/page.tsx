"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Briefcase, MapPin } from "lucide-react";
import { useSavedJobs } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Pagination } from "@/components/shared/pagination";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { formatDate, formatSalary } from "@/components/jobs/job-card";
import type { SavedJob } from "@/types/api/jobs";

const employmentLabel = (value: string) =>
  EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;

const preferenceLabel = (value: string) =>
  WORK_PREFERENCES.find((t) => t.value === value)?.label ?? value;

function SavedJobRow({ job }: { job: SavedJob }) {
  const preference = preferenceLabel(job.workPreference);
  const location = job.location ? `${job.location} · ${preference}` : preference;

  return (
    <div className="group flex flex-col gap-4 p-6 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Bookmark className="h-3.5 w-3.5" />
          Saved {formatDate(job.savedAt)}
        </div>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {job.companyName ?? "Company"}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight group-hover:text-primary">
          {job.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{location}</span>
          <span>{job.experienceRequired ?? "Any level"}</span>
          <span>{employmentLabel(job.employmentType)}</span>
          <span>{formatSalary(job)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <SaveJobButton jobId={job.id} />
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-border px-5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
        >
          <MapPin className="hidden" />
          View job
        </Link>
      </div>
    </div>
  );
}

export default function SavedJobsPage() {
  usePageTitle("Saved Jobs");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { user } = useAuth();
  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  const { data, isLoading, isError, error } = useSavedJobs(
    { page, limit },
    isTalent
  );

  if (!isTalent) {
    return (
      <AnimatedContent className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Briefcase}
            title="Sign in as a talent"
            description="Create a talent account to save jobs and revisit them later."
            action={
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign in
              </Link>
            }
          />
        </div>
      </AnimatedContent>
    );
  }

  const jobs = data?.jobs ?? [];
  const pagination = data?.pagination;

  return (
    <AnimatedContent className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination?.total ?? jobs.length} saved roles, ready when you are.
          </p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse jobs
        </Link>
      </div>

      {isError && (
        <ErrorAlert
          message={error instanceof Error ? error.message : "Failed to load saved jobs"}
        />
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border/15 bg-muted" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            description="Tap the bookmark icon on any job to save it for later."
            action={
              <Link
                href="/jobs"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse jobs
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {jobs.map((job) => (
              <SavedJobRow key={job.id} job={job} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </AnimatedContent>
  );
}
