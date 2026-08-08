"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronRight, Users } from "lucide-react";
import { useJobApplications, useJob, useUpdateApplicationStatus } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { APPLICATION_STATUSES } from "@/lib/constants/enums";
import { APPLICATION_STATUS } from "@/lib/constants/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/ui/form-textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/error-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ApplicationStatus,
  type Application,
} from "@/types/api/jobs";

const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  [ApplicationStatus.APPLIED]: ApplicationStatus.UNDER_REVIEW,
  [ApplicationStatus.UNDER_REVIEW]: ApplicationStatus.SHORTLISTED,
  [ApplicationStatus.SHORTLISTED]: ApplicationStatus.INTERVIEW,
  [ApplicationStatus.INTERVIEW]: ApplicationStatus.OFFERED,
  [ApplicationStatus.OFFERED]: ApplicationStatus.ACCEPTED,
};

const STATUS_LABEL: Record<ApplicationStatus, string> = Object.fromEntries(
  APPLICATION_STATUSES.map((s) => [s.value, s.label])
) as Record<ApplicationStatus, string>;

const TERMINAL: ApplicationStatus[] = [
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
];

export default function JobApplicationsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: job } = useJob(id);
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  usePageTitle(job ? `${job.title} — Applicants` : "Applicants");

  const { data, isLoading, isError, error } = useJobApplications(id, {
    status: status || undefined,
  });
  const updateStatus = useUpdateApplicationStatus();

  const applications = data?.applications ?? [];

  const advance = (application: Application) => {
    const next = NEXT_STATUS[application.status];
    if (!next) return;
    updateStatus.mutate(
      { id: application.id, data: { toStatus: next } },
      {
        onSuccess: () => toast.success("Application moved forward"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Update failed"),
      }
    );
  };

  const reject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    updateStatus.mutate(
      {
        id: rejectTarget.id,
        data: { toStatus: "rejected", rejectionReason: rejectReason },
      },
      {
        onSuccess: () => {
          toast.success("Application rejected");
          setRejectTarget(null);
          setRejectReason("");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Update failed"),
      }
    );
  };

  const filterTabs = [
    { value: "", label: "All" },
    ...APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ];

  return (
    <AnimatedContent className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={job ? job.title : "Applicants"}
        description="Review and manage applications for this job."
        backHref={job ? `/jobs/${job.id}` : "/jobs/mine"}
      />

      <div className="flex flex-wrap gap-1.5">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={status === tab.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatus(tab.value as ApplicationStatus | "")}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isError && <ErrorAlert message={error instanceof Error ? error.message : "Failed to load applications"} />}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-border/15 bg-muted" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Users}
            title="No applications yet"
            description="Applications for this job will appear here."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((application) => {
            const name =
              application.applicantName ||
              (application.talent
                ? `${application.talent.firstName} ${application.talent.lastName}`
                : "Candidate");
            const isTerminal = TERMINAL.includes(application.status);
            const next = NEXT_STATUS[application.status];

            return (
              <div
                key={application.id}
                className="group rounded-lg border border-border/15 p-4 transition-colors hover:border-border/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link
                    href={`/applications/${application.id}`}
                    className="min-w-0"
                  >
                    <span className="block text-sm font-medium transition-colors group-hover:text-primary group-hover:underline">
                      {name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {application.talent?.professionalTitle ??
                        application.applicantEmail ??
                        "No title"}{" "}
                      · Applied{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                    {application.talent?.skills && application.talent.skills.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1">
                        {application.talent.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </span>
                    )}
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={APPLICATION_STATUS[application.status] ?? undefined}>
                      {STATUS_LABEL[application.status] ?? application.status}
                    </Badge>
                    {!isTerminal && (
                      <>
                        {next && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updateStatus.isPending}
                            onClick={() => advance(application)}
                          >
                            {STATUS_LABEL[next]}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={updateStatus.isPending}
                          onClick={() => setRejectTarget(application)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              A rejection reason is required. It will be shown to the candidate.
            </DialogDescription>
          </DialogHeader>
          <FormTextarea
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Position has been filled"
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || updateStatus.isPending}
              onClick={reject}
            >
              Reject application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedContent>
  );
}
