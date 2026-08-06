"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Star,
  XCircle,
} from "lucide-react";
import {
  useAcceptOffer,
  useAdminApplication,
  useApplication,
  useUpdateApplicationStatus,
  useUpdateApplicationStatusAdmin,
} from "@/lib/hooks/use-jobs";
import { useCreateHireRating } from "@/lib/hooks/use-analytics";
import { useAuth } from "@/lib/auth/auth-context";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { APPLICATION_STATUS } from "@/lib/constants/status";
import { APPLICATION_STATUSES } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/ui/form-textarea";
import { ErrorAlert } from "@/components/shared/error-alert";
import { AnimatedContent } from "@/components/shared/animated-content";
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

function Timeline({ application }: { application: Application }) {
  const events = application.events ?? [];
  if (events.length === 0) return null;
  return (
    <div className="space-y-1">
      {events.map((event, index) => (
        <div key={event.id ?? index} className="relative flex gap-3 pb-4 last:pb-0">
          <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {STATUS_LABEL[event.toStatus as ApplicationStatus] ?? event.toStatus}
              {event.fromStatus && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  (from{" "}
                  {STATUS_LABEL[event.fromStatus as ApplicationStatus] ??
                    event.fromStatus}
                  )
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {event.actorRole?.replace(/_/g, " ") ?? "System"} ·{" "}
              {new Date(event.createdAt).toLocaleString()}
            </p>
            {event.note && <p className="mt-0.5 text-sm">{event.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function HireRatingCard({ applicationId }: { applicationId: string }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [done, setDone] = useState(false);
  const createHireRating = useCreateHireRating();

  const submit = () => {
    createHireRating.mutate(
      { applicationId, rating, review: review.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Hire rating submitted — thank you!");
          setDone(true);
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "";
          if (/already|rated|rated once/i.test(message)) {
            setDone(true);
          } else {
            toast.error(message || "Failed to submit rating");
          }
        },
      }
    );
  };

  return (
    <div className="rounded-xl border border-border/15 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Quality of hire
      </h2>
      {done ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Thanks! This hire has been rated.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Rate this candidate&apos;s quality as a hire from 1 to 5. This feeds
            your quality of hire metric.
          </p>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
              >
                <Star
                  className={cn(
                    "h-6 w-6",
                    value <= rating && "fill-amber-400 text-amber-400"
                  )}
                />
              </button>
            ))}
          </div>
          <FormTextarea
            className="mt-3"
            label="Review (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            placeholder="How was the candidate as a hire?"
          />
          <Button
            className="mt-3"
            onClick={submit}
            disabled={createHireRating.isPending}
          >
            Submit rating
          </Button>
        </>
      )}
    </div>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const isAdmin = user
    ? ((user.roles ?? []) as string[]).some((r) =>
        ["super_admin", "admin"].includes(r)
      )
    : false;
  const { data: application, isLoading, isError, error } = isAdmin
    ? useAdminApplication(id)
    : useApplication(id);
  const updateStatus = isAdmin
    ? useUpdateApplicationStatusAdmin()
    : useUpdateApplicationStatus();
  const acceptOffer = useAcceptOffer();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const isClient = user?.accountType === "client";
  const isTerminal = application ? TERMINAL.includes(application.status) : true;

  const detailName = isClient
    ? application?.applicantName ||
      (application?.talent
        ? `${application.talent.firstName} ${application.talent.lastName}`
        : "Candidate")
    : application?.job?.title ?? "Application";
  usePageTitle(detailName);

  const advance = () => {
    if (!application) return;
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
    if (!application || !rejectReason.trim()) return;
    updateStatus.mutate(
      {
        id: application.id,
        data: { toStatus: "rejected", rejectionReason: rejectReason },
      },
      {
        onSuccess: () => {
          toast.success("Application rejected");
          setRejectOpen(false);
          setRejectReason("");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Update failed"),
      }
    );
  };

  const withdraw = () => {
    if (!application) return;
    updateStatus.mutate(
      { id: application.id, data: { toStatus: "withdrawn" } },
      {
        onSuccess: () => {
          toast.success("Application withdrawn");
          setWithdrawOpen(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Update failed"),
      }
    );
  };

  const accept = () => {
    if (!application) return;
    acceptOffer.mutate(application.id, {
      onSuccess: () => toast.success("Offer accepted — congratulations!"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to accept offer"),
    });
  };

  if (isLoading) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-72 animate-pulse rounded-xl border border-border/15 bg-muted" />
      </AnimatedContent>
    );
  }

  if (isError || !application) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl space-y-6">
        <ErrorAlert message={error instanceof Error ? error.message : "Application not found"} />
      </AnimatedContent>
    );
  }

  const backHref = isClient
    ? `/jobs/manage/${application.jobId}/applications`
    : "/jobs";
  const next = NEXT_STATUS[application.status];
  const offerPending = !isClient && application.status === "offered";

  return (
    <AnimatedContent className="mx-auto max-w-3xl space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isClient
              ? application.applicantName ||
                (application.talent
                  ? `${application.talent.firstName} ${application.talent.lastName}`
                  : "Candidate")
              : application.job?.title ?? "Application"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isClient
              ? application.applicantEmail ||
                application.talent?.professionalTitle ||
                "Talent"
              : `${application.job?.companyName ?? "Company"} · ${application.job?.location ?? ""}`}
          </p>
        </div>
        <Badge className={APPLICATION_STATUS[application.status] ?? undefined}>
          {STATUS_LABEL[application.status] ?? application.status}
        </Badge>
      </div>

      {application.rejectionReason && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Rejection reason</p>
          <p className="mt-1">{application.rejectionReason}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {isClient && (application.talent || application.applicantEmail) && (
          <div className="rounded-xl border border-border/15 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Applicant
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{application.applicantEmail || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{application.applicantPhone ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Location</dt>
                <dd>{application.talent?.country ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Experience</dt>
                <dd>
                  {application.yearsOfExperience != null
                    ? `${application.yearsOfExperience} yrs`
                    : application.talent?.yearsOfExperience != null
                      ? `${application.talent.yearsOfExperience} yrs`
                      : "—"}
                </dd>
              </div>
              {application.talent?.skills &&
                application.talent.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {application.talent.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
            </dl>
          </div>
        )}

        {application.job && (
          <div className="rounded-xl border border-border/15 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Job
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-medium">{application.job.title}</p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                {application.job.companyName}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {application.job.location}
              </div>
              {application.job.salaryMin != null && (
                <p className="font-medium">
                  {application.job.salaryMin.toLocaleString()}
                  {application.job.salaryMax != null &&
                    ` – ${application.job.salaryMax.toLocaleString()}`}{" "}
                  {application.job.currency?.toUpperCase()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/15 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Cover letter
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm">
          {application.coverLetter ?? "No cover letter provided."}
        </p>
        {application.proposedRate != null && (
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Proposed rate: </span>
            <span className="font-medium">
              {application.proposedRate.toLocaleString()}{" "}
              {application.currency?.toUpperCase()}
            </span>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border/15 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Timeline
        </h2>
        <Timeline application={application} />
      </div>

      {isClient && application.status === "accepted" && (
        <HireRatingCard applicationId={application.id} />
      )}

      {!isTerminal && (
        <div className="flex flex-wrap gap-2">
          {isClient ? (
            <>
              {next && (
                <Button onClick={advance} disabled={updateStatus.isPending}>
                  Move to {STATUS_LABEL[next]}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          ) : (
            <>
              {offerPending && (
                <Button onClick={accept} disabled={acceptOffer.isPending}>
                  <CheckCircle2 className="h-4 w-4" />
                  Accept offer
                </Button>
              )}
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setWithdrawOpen(true)}
              >
                Withdraw application
              </Button>
            </>
          )}
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
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
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
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

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw application?</DialogTitle>
            <DialogDescription>
              You can&apos;t undo this. The client will be notified that you withdrew.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={updateStatus.isPending}
              onClick={withdraw}
            >
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedContent>
  );
}
