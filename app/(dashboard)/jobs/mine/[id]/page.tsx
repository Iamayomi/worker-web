"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  CalendarClock,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useJob, useDeleteJob } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import { JOB_STATUS } from "@/lib/constants/status";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ShareJobButton } from "@/components/jobs/share-job-button";
import { formatDate, formatSalary } from "@/components/jobs/job-card";

const employmentLabel = (value: string) =>
  EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;

const preferenceLabel = (value: string) =>
  WORK_PREFERENCES.find((t) => t.value === value)?.label ?? value;

export default function MyJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: job, isLoading, isError, error } = useJob(id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteJob = useDeleteJob();

  usePageTitle(job?.title);

  const handleDelete = () => {
    deleteJob.mutate(id, {
      onSuccess: () => {
        toast.success("Job deleted");
        router.push("/jobs/mine");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete job");
      },
    });
  };

  if (isLoading) {
    return (
      <AnimatedContent className="mx-auto max-w-5xl space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-64 animate-pulse rounded-xl border border-border/15 bg-muted" />
          <div className="h-72 animate-pulse rounded-xl border border-border/15 bg-muted" />
        </div>
      </AnimatedContent>
    );
  }

  if (isError || !job) {
    return (
      <AnimatedContent className="mx-auto max-w-5xl space-y-6">
        <ErrorAlert message={error instanceof Error ? error.message : "Job not found"} />
        <Button asChild variant="outline">
          <Link href="/jobs/mine">Back to my jobs</Link>
        </Button>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.companyName ?? "Your company"} · ${job.location}`}
        backHref="/jobs/mine"
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/jobs/manage/${job.id}/applications`}>
                <Users className="h-4 w-4" />
                View applicants
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/jobs/manage/${job.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={JOB_STATUS[job.status] ?? undefined}>
          {job.status.replace(/_/g, " ")}
        </Badge>
        <Badge variant="secondary">{employmentLabel(job.employmentType)}</Badge>
        <Badge variant="secondary">{preferenceLabel(job.workPreference)}</Badge>
        {job.category && <Badge variant="secondary">{job.category}</Badge>}
        {job.experienceRequired && (
          <Badge variant="secondary">{job.experienceRequired}</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About this role
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {job.description}
            </div>
          </div>

          {job.skillsRequired.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skillsRequired.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-fit space-y-4 rounded-xl border border-border/15 p-5 lg:sticky lg:top-24">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Salary
              </span>
              <span className="font-medium">{formatSalary(job)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Location
              </span>
              <span className="text-right font-medium">{job.location}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Company
              </span>
              <span className="text-right font-medium">
                {job.companyName ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                Posted
              </span>
              <span className="font-medium">{formatDate(job.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                Closes
              </span>
              <span className="font-medium">{formatDate(job.expiresAt)}</span>
            </div>
          </div>

          <ShareJobButton title={job.title} withLabel />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
        title="Delete this job?"
        message="This will permanently remove the job listing and its applications."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </AnimatedContent>
  );
}
