"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronRight, FileText } from "lucide-react";
import { useMyApplications } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { APPLICATION_STATUSES } from "@/lib/constants/enums";
import { APPLICATION_STATUS } from "@/lib/constants/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Pagination } from "@/components/shared/pagination";
import { ApplicationStats } from "@/components/applications/application-stats";
import type {
  Application,
  ApplicationStatus,
} from "@/types/api/jobs";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyApplicationsPage() {
  usePageTitle("My Applications");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const limit = 10;

  const { data, isLoading, isError, error } = useMyApplications({
    status: status || undefined,
    page,
    limit,
  });

  const applications: Application[] = data?.applications ?? [];
  const pagination = data?.pagination;

  const filterTabs = [
    { value: "", label: "All" },
    ...APPLICATION_STATUSES.map((s) => ({
      value: s.value,
      label: s.label,
    })),
  ];

  return (
    <AnimatedContent className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="My applications"
        description="Track the jobs you've applied to."
        backHref="/jobs"
      />

      <ApplicationStats />

      <div className="flex flex-wrap gap-1.5">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={status === tab.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setStatus(tab.value as ApplicationStatus | "");
              setPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isError && (
        <ErrorAlert
          message={
            error instanceof Error
              ? error.message
              : "Failed to load applications"
          }
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-border/15 bg-muted"
            />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Apply to a job to start tracking it here."
            action={
              <Button asChild>
                <Link href="/jobs">
                  <Briefcase className="h-4 w-4" />
                  Browse jobs
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((application) => (
            <Link
              key={application.id}
              href={`/applications/${application.id}`}
              className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/15 p-4 transition-colors hover:border-border/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium group-hover:underline">
                    {application.job?.title ?? "Job"}
                  </span>
                  <Badge
                    className={
                      APPLICATION_STATUS[application.status] ?? undefined
                    }
                  >
                    {application.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {application.job?.companyName ?? "Company"} ·{" "}
                  {application.job?.location ?? "—"} · Applied{" "}
                  {formatDate(application.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                {application.proposedRate != null && (
                  <span>
                    {application.currency ?? ""}{" "}
                    {application.proposedRate}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
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
    </AnimatedContent>
  );
}
