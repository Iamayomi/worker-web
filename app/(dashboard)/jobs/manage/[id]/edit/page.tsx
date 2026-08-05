"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useJob, useUpdateJob } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/error-alert";
import { JobForm } from "@/components/jobs/job-form";

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: job, isLoading, isError, error } = useJob(id);
  const updateJob = useUpdateJob(id);

  usePageTitle(job ? `Edit: ${job.title}` : "Edit job");

  if (isLoading) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-xl border border-border/15 bg-muted" />
      </AnimatedContent>
    );
  }

  if (isError || !job) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl space-y-6">
        <ErrorAlert message={error instanceof Error ? error.message : "Job not found"} />
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit job"
        description={job.title}
        backHref="/jobs/mine"
      />
      <div className="rounded-xl border border-border/15 p-6">
        <JobForm
          initial={job}
          submitLabel="Save changes"
          submitting={updateJob.isPending}
          onSubmit={(data) => {
            updateJob.mutate(data, {
              onSuccess: () => {
                toast.success("Job updated");
                router.push("/jobs/mine");
              },
              onError: (err) => {
                toast.error(err instanceof Error ? err.message : "Failed to update job");
              },
            });
          }}
        />
      </div>
    </AnimatedContent>
  );
}
