"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Globe,
  Link2,
  LoaderCircle,
  MapPin,
  MessageCircle,
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
import { useCreateHireRating, useRecordAnalyticsEvent } from "@/lib/hooks/use-analytics";
import { useAuth } from "@/lib/auth/auth-context";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { usePublicTalentProfile } from "@/lib/hooks/use-profiles";
import { useCreateConversation } from "@/lib/hooks/use-chat";
import { APPLICATION_STATUS } from "@/lib/constants/status";
import { APPLICATION_STATUSES } from "@/lib/constants/enums";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormSelect } from "@/components/ui/form-select";
import { ErrorAlert } from "@/components/shared/error-alert";
import { AnimatedContent } from "@/components/shared/animated-content";
import { FollowButton } from "@/components/shared/follow-button";
import {
  CertificationList,
  EducationList,
  WorkExperienceList,
} from "@/components/profile/talent-entry-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const STATUS_LABEL: Record<ApplicationStatus, string> = Object.fromEntries(
  APPLICATION_STATUSES.map((s) => [s.value, s.label])
) as Record<ApplicationStatus, string>;

const CLIENT_STATUS_OPTIONS = APPLICATION_STATUSES.filter((s) =>
  ["under_review", "shortlisted", "interview", "offered", "accepted"].includes(
    s.value
  )
);

const TERMINAL: ApplicationStatus[] = [
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
];

const employmentLabel = (value?: string) =>
  EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;

const preferenceLabel = (value?: string) =>
  WORK_PREFERENCES.find((t) => t.value === value)?.label ?? value;

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
  const router = useRouter();
  const { user } = useAuth();
  const createConversation = useCreateConversation();
  const recordEvent = useRecordAnalyticsEvent();
  const [startingChat, setStartingChat] = useState(false);
  const [downloadingCv, setDownloadingCv] = useState(false);
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

  const isClient = user?.accountType === "client";
  const talentProfileId = isClient ? application?.talent?.id ?? "" : "";
  const { data: talentProfile } = usePublicTalentProfile(talentProfileId);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState<ApplicationStatus | "">("");

  const isTerminal = application ? TERMINAL.includes(application.status) : true;

  const detailName = isClient
    ? application?.applicantName ||
      (application?.talent
        ? `${application.talent.firstName} ${application.talent.lastName}`
        : "Candidate")
    : application?.job?.title ?? "Application";
  usePageTitle(detailName);

  const startChat = async () => {
    if (!talentProfile) return;
    setStartingChat(true);
    try {
      const result = await createConversation.mutateAsync({
        participantIds: [talentProfile.userId],
      });
      if (result?.id) {
        router.push(`/messages/${result.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setStartingChat(false);
    }
  };

  const downloadCv = async () => {
    if (!talentProfile?.resumeUrl) return;
    setDownloadingCv(true);
    try {
      recordEvent.mutate({
        eventType: "resume_download",
        targetType: "talent_profile",
        targetId: talentProfile.id,
      });
      const res = await fetch(talentProfile.resumeUrl);
      if (!res.ok) throw new Error("Failed to download CV");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${[talentProfile.firstName, talentProfile.lastName]
        .filter(Boolean)
        .join("_") || "candidate"}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.open(talentProfile.resumeUrl, "_blank", "noopener,noreferrer");
      toast.error(
        err instanceof Error ? err.message : "Failed to download CV"
      );
    } finally {
      setDownloadingCv(false);
    }
  };

  const applyStatus = () => {
    if (!application || !statusDraft) return;
    updateStatus.mutate(
      { id: application.id, data: { toStatus: statusDraft } },
      {
        onSuccess: () => {
          toast.success("Application status updated");
          setStatusDraft("");
        },
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={APPLICATION_STATUS[application.status] ?? undefined}>
            {STATUS_LABEL[application.status] ?? application.status}
          </Badge>
          {isClient && talentProfile && (
            <>
              <FollowButton targetUserId={talentProfile.userId} />
              <Button
                variant="outline"
                onClick={startChat}
                disabled={startingChat || createConversation.isPending}
              >
                {startingChat ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      {application.rejectionReason && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Rejection reason</p>
          <p className="mt-1">{application.rejectionReason}</p>
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

      {isClient && talentProfileId && (
        <div className="space-y-4">
          {!talentProfile ? (
            <div className="rounded-xl border border-border/15 p-5">
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border/15 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar className="size-14">
                      {talentProfile.avatarUrl && (
                        <AvatarImage
                          src={talentProfile.avatarUrl}
                          alt={`${talentProfile.firstName} ${talentProfile.lastName}`}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="font-semibold">
                        {[talentProfile.firstName, talentProfile.lastName]
                          .filter(Boolean)
                          .map((name) => name[0]?.toUpperCase() ?? "")
                          .join("") || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link
                        href={`/talent/${talentProfile.id}`}
                        className="font-semibold transition-colors hover:text-primary hover:underline"
                      >
                        {[talentProfile.firstName, talentProfile.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {talentProfile.professionalTitle ?? "Talent"}
                      </p>
                      {[talentProfile.country, talentProfile.stateOfResidence]
                        .filter(Boolean)
                        .join(", ") && (
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[talentProfile.country, talentProfile.stateOfResidence]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {talentProfile.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {talentProfile.bio}
                  </p>
                )}

                {talentProfile.skills && talentProfile.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {talentProfile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{application.applicantEmail || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{application.applicantPhone ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Experience</dt>
                    <dd>
                      {talentProfile.yearsOfExperience != null
                        ? `${talentProfile.yearsOfExperience} ${
                            talentProfile.yearsOfExperience === 1 ? "year" : "years"
                          }`
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Employment type</dt>
                    <dd>{employmentLabel(talentProfile.employmentType) ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Work preference</dt>
                    <dd>{preferenceLabel(talentProfile.workPreference) ?? "—"}</dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-2 border-t border-border/10 pt-4">
                  {talentProfile.resumeUrl && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/10 px-3 py-2">
                      <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">CV / Résumé</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={talentProfile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={downloadCv}
                          disabled={downloadingCv}
                        >
                          {downloadingCv ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Download
                        </Button>
                      </span>
                    </div>
                  )}
                  {talentProfile.portfolioUrl && (
                    <a
                      href={talentProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                  {talentProfile.linkedinUrl && (
                    <a
                      href={talentProfile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Link2 className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              <WorkExperienceList talentProfileId={talentProfileId} />
              <EducationList talentProfileId={talentProfileId} />
              <CertificationList talentProfileId={talentProfileId} />
            </>
          )}
        </div>
      )}

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

      {(isClient || !isTerminal) && (
        <div className="flex flex-wrap items-end gap-3">
          {isClient ? (
            <>
              <FormSelect
                label="Application status"
                value={statusDraft || application.status || ""}
                onValueChange={(value) => setStatusDraft(value as ApplicationStatus | "")}
                options={CLIENT_STATUS_OPTIONS}
                className="min-w-52"
              />
              <Button
                onClick={applyStatus}
                disabled={
                  updateStatus.isPending || !statusDraft || statusDraft === application.status
                }
              >
                {updateStatus.isPending && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Update status
              </Button>
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
