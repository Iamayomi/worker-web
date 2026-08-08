"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useJob, useDeleteJob } from "@/lib/hooks/use-jobs";
import { useClientProfile } from "@/lib/hooks/use-profiles";
import { useAuth } from "@/lib/auth/auth-context";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { UserRole } from "@/types/api/auth";
import { ApplicationType } from "@/types/api/jobs";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import { JOB_STATUS } from "@/lib/constants/status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorAlert } from "@/components/shared/error-alert";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { ShareJobButton } from "@/components/jobs/share-job-button";
import { CompanyLink } from "@/components/jobs/company-link";
import { formatDate, formatSalary } from "@/components/jobs/job-card";

const employmentLabel = (value: string) =>
  EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;

const preferenceLabel = (value: string) =>
  WORK_PREFERENCES.find((t) => t.value === value)?.label ?? value;

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { data: job, isLoading, isError, error } = useJob(params.id);
  const [applyOpen, setApplyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  usePageTitle(job?.title);

  const isClient = user?.accountType === "client";
  const { data: clientProfile } = useClientProfile(isClient);
  const isOwner = Boolean(job && clientProfile && job.clientProfileId === clientProfile.id);

  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const canApply =
    job?.status === "published" && !isOwner && !isClient && !isAdmin;

  const deleteJob = useDeleteJob();

  const handleDelete = () => {
    if (!job) return;
    deleteJob.mutate(job.id, {
      onSuccess: () => {
        toast.success("Job deleted");
        router.push(isClient ? "/jobs/mine" : "/jobs");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete job");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="h-64 animate-pulse rounded-xl border border-border/15 bg-muted" />
          <div className="h-72 animate-pulse rounded-xl border border-border/15 bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
        <ErrorAlert message={error instanceof Error ? error.message : "Job not found"} />
        <Button asChild variant="outline">
          <Link href="/jobs">Back to jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
      <Link
        href={isClient ? "/jobs/mine" : "/jobs"}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />{" "}
        {isClient ? "Back to my jobs" : "Back to jobs"}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isOwner && (
                <Badge className={JOB_STATUS[job.status] ?? undefined}>
                  {job.status.replace(/_/g, " ")}
                </Badge>
              )}
              {job.matchLabel && (
                <Badge className="bg-emerald-500/10 text-emerald-600">
                  {job.matchLabel}
                  {job.matchScore != null && ` · ${Math.round(job.matchScore)}%`}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {job.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <CompanyLink
                clientProfileId={job.clientProfileId}
                companyName={job.companyName ?? "Company"}
              />{" "}
              · {job.location}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{employmentLabel(job.employmentType)}</Badge>
            <Badge variant="secondary">{preferenceLabel(job.workPreference)}</Badge>
            {job.category && <Badge variant="secondary">{job.category}</Badge>}
            {job.experienceRequired && (
              <Badge variant="secondary">{job.experienceRequired}</Badge>
            )}
          </div>

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

          <div className="border-t border-border/15 pt-4">
            <ShareJobButton title={job.title} withLabel className="mb-2" />
            {isOwner ? (
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={`/jobs/manage/${job.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit job
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/jobs/manage/${job.id}/applications`}>
                    <Users className="h-4 w-4" />
                    View applicants
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete job
                </Button>
              </div>
            ) : job.status !== "published" ? (
              <p className="text-center text-sm text-muted-foreground">
                This job is no longer accepting applications.
              </p>
            ) : job.applicationType === ApplicationType.EMAIL &&
              job.applicationEmail ? (
              <div className="space-y-3">
                {isAuthenticated && <SaveJobButton jobId={job.id} withLabel />}
                <Button asChild className="w-full" size="lg">
                  <a
                    href={`mailto:${job.applicationEmail}?subject=${encodeURIComponent(
                      `Application for ${job.title}`
                    )}`}
                  >
                    Apply via email
                  </a>
                </Button>
              </div>
            ) : job.applicationType === ApplicationType.EXTERNAL_LINK &&
              job.applicationExternalUrl ? (
              <div className="space-y-3">
                {isAuthenticated && <SaveJobButton jobId={job.id} withLabel />}
                <Button asChild className="w-full" size="lg">
                  <a
                    href={job.applicationExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply on company site
                  </a>
                </Button>
              </div>
            ) : canApply ? (
              <div className="space-y-3">
                {isAuthenticated && <SaveJobButton jobId={job.id} withLabel />}
                <Button className="w-full" size="lg" onClick={() => setApplyOpen(true)}>
                  Apply now
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {canApply && (
        <ApplyJobDialog job={job} open={applyOpen} onOpenChange={setApplyOpen} />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this job?"
        message="This will permanently remove the job listing and its applications."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
