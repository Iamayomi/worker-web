"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { useJobs } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import {
  JOB_CATEGORIES,
  JOB_EXPERIENCE_LEVELS,
} from "@/lib/constants/options";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Pagination } from "@/components/shared/pagination";
import { JobCardSkeleton } from "@/components/shared/skeletons";
import { formatSalary } from "@/components/jobs/job-card";
import { CompanyLink } from "@/components/jobs/company-link";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import type { Job } from "@/types/api/jobs";
import type { EmploymentType, WorkPreference } from "@/types/api/auth";

const employmentLabel = (value: string) =>
  EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;

const preferenceLabel = (value: string) =>
  WORK_PREFERENCES.find((t) => t.value === value)?.label ?? value;

function JobRow({ job }: { job: Job }) {
  const preference = preferenceLabel(job.workPreference);
  const location = job.location ? `${job.location} · ${preference}` : preference;

  return (
    <div className="group flex flex-col gap-4 p-6 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">
          {job.companyName ? (
            <CompanyLink
              clientProfileId={job.clientProfileId}
              companyName={job.companyName}
              className="text-sm"
            />
          ) : (
            "Company"
          )}
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
        {job.skillsRequired.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {job.skillsRequired.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {job.skillsRequired.length > 5 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{job.skillsRequired.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          {job.matchLabel && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                job.matchLabel === "Perfect Match"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {job.matchLabel}
            </span>
          )}
          <div className="flex items-center gap-2">
            <SaveJobButton jobId={job.id} />
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              Apply
            </Link>
          </div>
        </div>
    </div>
  );
}

function JobsContent() {
  const searchParams = useSearchParams();
  usePageTitle("Browse Jobs");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [clientProfileId, setClientProfileId] = useState(
    searchParams.get("clientProfileId") ?? ""
  );
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [experience, setExperience] = useState(
    searchParams.get("experience") ?? ""
  );
  const [workPreference, setWorkPreference] = useState<WorkPreference | "">(
    (searchParams.get("workPreference") as WorkPreference) ?? ""
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");
  const [sort, setSort] = useState<"newest" | "salary">("newest");
  const limit = 12;

  const { user, isAuthenticated } = useAuth();
  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  const { data, isLoading, isError, error } = useJobs({
    query,
    location,
    category: category || undefined,
    experience: experience || undefined,
    workPreference: workPreference || undefined,
    employmentType: employmentType || undefined,
    clientProfileId: clientProfileId || undefined,
    sort,
    page,
    limit,
  });

  const jobs = data?.jobs ?? [];
  const pagination = data?.pagination;

  const resetPage = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setLocation("");
    setClientProfileId("");
    setCategory("");
    setExperience("");
    setWorkPreference("");
    setEmploymentType("");
    setSort("newest");
    setPage(1);
  };

  return (
    <AnimatedContent className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Browse jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination?.total ?? jobs.length} roles available now from verified clients.
          </p>
        </div>
        {!isTalent && (
          <Link
            href={isAuthenticated ? "/dashboard/jobs/new" : "/jobs/new"}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Post a job
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 md:items-stretch">
          <div className="px-5 py-4 text-left">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              What
            </label>
            <input
              value={query}
              onChange={(e) => resetPage(setQuery, e.target.value)}
              placeholder="Job title, keyword, or company"
              className="mt-1 w-full bg-transparent text-base font-medium focus:outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="border-t border-border px-5 py-4 text-left md:border-l md:border-t-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Where
            </label>
            <input
              value={location}
              onChange={(e) => resetPage(setLocation, e.target.value)}
              placeholder="Anywhere"
              className="mt-1 w-full bg-transparent text-base font-medium focus:outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="border-t border-border px-5 py-4 text-left md:border-l md:border-t-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <Select
              value={category || "all"}
              onValueChange={(value) =>
                resetPage(setCategory, value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="all">All categories</SelectItem>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-border px-5 py-4 text-left md:border-l md:border-t-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Experience
            </label>
            <Select
              value={experience || "all"}
              onValueChange={(value) =>
                resetPage(setExperience, value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="all">Any level</SelectItem>
                {JOB_EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-border px-5 py-4 text-left md:border-l">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </label>
            <Select
              value={employmentType || "all"}
              onValueChange={(value) => {
                setEmploymentType((value === "all" ? "" : value) as EmploymentType | "");
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="all">All types</SelectItem>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-border px-5 py-4 text-left md:border-l">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Work preference
            </label>
            <Select
              value={workPreference || "all"}
              onValueChange={(value) => {
                setWorkPreference(
                  (value === "all" ? "" : value) as WorkPreference | ""
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="all">Any</SelectItem>
                {WORK_PREFERENCES.map((pref) => (
                  <SelectItem key={pref.value} value={pref.value}>
                    {pref.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-border px-5 py-4 text-left md:border-l">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sort
            </label>
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as "newest" | "salary");
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="salary">Highest salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end border-t border-border p-3 text-left md:border-l">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      {isError && <ErrorAlert message={error instanceof Error ? error.message : "Failed to load jobs"} />}

      {isLoading ? (
        <JobCardSkeleton count={4} />
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Try adjusting your search or filters."
          />
        </div>
      ) : (
        <>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} />
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

          {!isAuthenticated && (
            <p className="text-center text-sm text-muted-foreground">
              Not seeing the right fit?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Create a talent profile
              </Link>{" "}
              to get matched.
            </p>
          )}
        </>
      )}
    </AnimatedContent>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={null}>
      <JobsContent />
    </Suspense>
  );
}
