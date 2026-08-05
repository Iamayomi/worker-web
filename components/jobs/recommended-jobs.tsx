"use client";

import Link from "next/link";
import { Briefcase, Loader2 } from "lucide-react";
import { useRecommendedJobs } from "@/lib/hooks/use-jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { JobCard } from "@/components/jobs/job-card";

export function RecommendedJobs({ pageSize = 6 }: { pageSize?: number }) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useRecommendedJobs(pageSize);

  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: pageSize }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Couldn&apos;t load recommendations right now.
      </p>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-border/15">
        <EmptyState
          icon={Briefcase}
          title="No recommendations yet"
          description="Complete your profile to get personalised job matches."
          action={
            <Button asChild>
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more recommendations"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
