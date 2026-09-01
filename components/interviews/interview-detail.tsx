"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
 CalendarDays,
 CheckCircle2,
 Clock,
 Download,
 ExternalLink,
 Globe,
 LoaderCircle,
 Star,
 Users,
 Video,
} from "lucide-react";
import {
 useInterview,
 useInterviewAction,
 useRequestReschedule,
 useRescheduleInterview,
 useSubmitInterviewFeedback,
 useUpdateInterviewStatusAdmin,
 useAddMeetLink,
} from "@/lib/hooks/use-interviews";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useAuth } from "@/lib/auth/auth-context";
import {
 INTERVIEW_RSVP_STATUSES,
 INTERVIEW_STATUSES,
} from "@/lib/constants/enums";
import { INTERVIEW_RSVP_STATUS } from "@/lib/constants/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorAlert } from "@/components/shared/error-alert";
import { AnimatedContent } from "@/components/shared/animated-content";
import { InterviewStatusBadge } from "./interview-status-badge";
import { NoteDialog } from "./note-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { FeedbackDialog } from "./feedback-dialog";
import {
 downloadIcs,
 formatInterviewDate,
 interviewTypeLabel,
} from "./format";
import {
 InterviewParty,
 InterviewStatus,
 VideoProvider,
 type InterviewData,
} from "@/types/api/interviews";

const EVENT_LABEL: Record<string, string> = {
 created: "Interview created",
 accepted: "Invitation accepted",
 declined: "Invitation declined",
 reschedule_requested: "Reschedule requested",
 rescheduled: "Rescheduled",
 cancelled: "Cancelled",
 completed: "Completed",
 feedback_submitted: "Feedback submitted",
 participant_added: "Participant added",
 joined: "Interviewer joined",
};

const RSVP_LABEL: Record<string, string> = Object.fromEntries(
 INTERVIEW_RSVP_STATUSES.map((s) => [s.value, s.label])
) as Record<string, string>;

function initials(firstName?: string, lastName?: string): string {
 return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function DetailCard({
 interview,
}: {
 interview: InterviewData;
}) {
 const rating = interview.rating;
 return (
 <div className=" border border-border/15 p-5">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
 Details
 </h2>
 <dl className="mt-3 space-y-2.5 text-sm">
 <div className="flex justify-between gap-2">
 <dt className="text-muted-foreground">Type</dt>
 <dd>{interviewTypeLabel(interview.type)}</dd>
 </div>
 <div className="flex justify-between gap-2">
 <dt className="text-muted-foreground">When</dt>
 <dd>{formatInterviewDate(interview.scheduledAt, interview.timezone)}</dd>
 </div>
 <div className="flex justify-between gap-2">
 <dt className="text-muted-foreground">Timezone</dt>
 <dd>{interview.timezone}</dd>
 </div>
 <div className="flex justify-between gap-2">
 <dt className="text-muted-foreground">Duration</dt>
 <dd>{interview.durationMinutes} minutes</dd>
 </div>
 {interview.location && (
 <div className="flex justify-between gap-2">
 <dt className="text-muted-foreground">Location</dt>
 <dd className="text-right">{interview.location}</dd>
 </div>
 )}
 {interview.meetingLink && (
 <div className="flex items-center justify-between gap-2">
 <dt className="flex items-center gap-1.5 text-muted-foreground">
 Meeting
 {interview.videoProvider === VideoProvider.GOOGLE_MEET && (
 <Badge variant="outline" className="text-[10px] font-normal">
 Google Meet
 </Badge>
 )}
 </dt>
 <dd>
 <Button asChild variant="link" size="sm" className="h-auto px-0">
 <a
 href={interview.meetingLink}
 target="_blank"
 rel="noopener noreferrer"
 >
 Join meeting
 <ExternalLink className="ml-1 h-3.5 w-3.5" />
 </a>
 </Button>
 </dd>
 </div>
 )}
 {interview.proposedRescheduleAt && (
 <div className="flex justify-between gap-2">
 <dt className="text-muted-foreground">Proposed time</dt>
 <dd>
 {formatInterviewDate(interview.proposedRescheduleAt, interview.timezone)}
 </dd>
 </div>
 )}
 {rating != null && (
 <div className="flex items-center justify-between gap-2">
 <dt className="text-muted-foreground">Rating</dt>
 <dd className="inline-flex items-center gap-0.5">
 {rating}
 <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
 </dd>
 </div>
 )}
 </dl>
 </div>
 );
}

function CounterpartyCard({ interview }: { interview: InterviewData }) {
 const job = interview.job;
 const candidate = interview.candidate;
 return (
 <div className=" border border-border/15 p-5">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
 {job ? "Job" : "Candidate"}
 </h2>
 {job ? (
 <div className="mt-3 space-y-1.5">
 <Link
 href={`/jobs/${job.id}`}
 className="block font-semibold transition-colors hover:text-primary hover:underline"
 >
 {job.title}
 </Link>
 <p className="text-sm text-muted-foreground">{job.companyName}</p>
 </div>
 ) : candidate ? (
 <div className="mt-3 flex items-center gap-3">
 <Avatar className="size-10">
 {candidate.avatarUrl && (
 <AvatarImage
 src={candidate.avatarUrl}
 alt={`${candidate.firstName} ${candidate.lastName}`}
 className="object-cover"
 />
 )}
 <AvatarFallback>
 {initials(candidate.firstName, candidate.lastName)}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0">
 <Link
 href={`/talent/${candidate.id}`}
 className="block font-semibold transition-colors hover:text-primary hover:underline"
 >
 {candidate.firstName} {candidate.lastName}
 </Link>
 <p className="truncate text-sm text-muted-foreground">
 {candidate.professionalTitle ?? candidate.email ?? ""}
 </p>
 </div>
 </div>
 ) : null}
 {interview.feedback && (
 <div className="mt-4 border-t border-border/10 pt-3">
 <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
 Feedback
 </p>
 <p className="mt-1.5 whitespace-pre-line text-sm">{interview.feedback}</p>
 </div>
 )}
 </div>
 );
}

function ParticipantsCard({
 interview,
}: {
 interview: InterviewData;
}) {
 const participants = interview.participants ?? [];
 if (participants.length === 0) return null;
 return (
 <div className=" border border-border/15 p-5">
 <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
 <Users className="h-4 w-4" />
 Participants
 </h2>
 <div className="mt-3 space-y-3">
 {participants.map((participant) => (
 <div key={participant.id} className="flex items-center justify-between gap-3">
 <div className="flex min-w-0 items-center gap-3">
 <Avatar className="size-9">
 {participant.profile?.avatarUrl && (
 <AvatarImage
 src={participant.profile.avatarUrl}
 alt={`${participant.profile.firstName} ${participant.profile.lastName}`}
 className="object-cover"
 />
 )}
 <AvatarFallback>
 {initials(
 participant.profile?.firstName,
 participant.profile?.lastName
 )}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0">
 <p className="truncate text-sm font-medium">
 {participant.profile?.firstName} {participant.profile?.lastName}
 </p>
 <p className="truncate text-xs text-muted-foreground">
 {participant.party === InterviewParty.TALENT
 ? participant.profile?.professionalTitle ?? "Talent"
 : participant.profile?.companyName ?? "Client"}
 </p>
 </div>
 </div>
 <Badge
 className={
 INTERVIEW_RSVP_STATUS[participant.rsvpStatus] ?? undefined
 }
 >
 {RSVP_LABEL[participant.rsvpStatus] ?? participant.rsvpStatus}
 </Badge>
 </div>
 ))}
 </div>
 </div>
 );
}

function TimelineCard({ interview }: { interview: InterviewData }) {
 const events = interview.events ?? [];
 if (events.length === 0) return null;
 return (
 <div className=" border border-border/15 p-5">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
 Timeline
 </h2>
 <div className="mt-4 space-y-1">
 {events.map((event, index) => (
 <div key={event.id ?? index} className="relative flex gap-3 pb-4 last:pb-0">
 <div className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-primary" />
 <div className="min-w-0">
 <p className="text-sm font-medium">
 {EVENT_LABEL[event.eventType] ?? event.eventType}
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
 </div>
 );
}

function CalendarLinksCard({ interview }: { interview: InterviewData }) {
 const calendar = interview.calendar;
 if (!calendar) return null;
 const filename = `interview-${interview.id}.ics`;
 return (
 <div className=" border border-border/15 p-5">
 <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
 <CalendarDays className="h-4 w-4" />
 Add to calendar
 </h2>
 <div className="mt-3 flex flex-wrap gap-2">
 <Button asChild size="sm" variant="outline">
 <a href={calendar.googleUrl} target="_blank" rel="noopener noreferrer">
 <Globe className="h-4 w-4" />
 Google Calendar
 </a>
 </Button>
 <Button asChild size="sm" variant="outline">
 <a href={calendar.outlookUrl} target="_blank" rel="noopener noreferrer">
 <CalendarDays className="h-4 w-4" />
 Outlook
 </a>
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => downloadIcs(calendar.ics, filename)}
 >
 <Download className="h-4 w-4" />
 .ics file
 </Button>
 </div>
 </div>
 );
}

export function InterviewDetail({ id }: { id: string }) {
 const { user } = useAuth();
 const { data: interview, isLoading, isError, error } = useInterview(id);
 usePageTitle("Interview");

 const [confirmNote, setConfirmNote] = useState("");
 const [dialog, setDialog] = useState<
 "accept" | "decline" | "join" | "cancel" | "complete" | null
 >(null);
 const [rescheduleMode, setRescheduleMode] = useState<
 "request" | "confirm" | null
 >(null);
 const [feedbackOpen, setFeedbackOpen] = useState(false);

 const accept = useInterviewAction("accept");
 const decline = useInterviewAction("decline");
 const join = useInterviewAction("join");
 const cancel = useInterviewAction("cancel");
 const complete = useInterviewAction("complete");
 const requestReschedule = useRequestReschedule();
 const reschedule = useRescheduleInterview();
 const submitFeedback = useSubmitInterviewFeedback();
 const updateStatus = useUpdateInterviewStatusAdmin();
 const addMeetLink = useAddMeetLink();
 const [statusDraft, setStatusDraft] = useState<InterviewStatus | "">("");

 const myRoles = ((user?.roles ?? []) as string[]);
 const isAdmin =
 myRoles.includes("super_admin") || myRoles.includes("admin");
 const isClient = user?.accountType === "client" && !isAdmin;
 const isTalent = user?.accountType === "talent" && !isAdmin;

 if (isLoading) {
 return (
 <AnimatedContent className="mx-auto max-w-3xl space-y-6">
 <div className="h-8 w-56 animate-pulse bg-muted" />
 <div className="h-72 animate-pulse border border-border/15 bg-muted" />
 </AnimatedContent>
 );
 }

 if (isError || !interview) {
 return (
 <AnimatedContent className="mx-auto max-w-3xl space-y-6">
 <ErrorAlert
 message={error instanceof Error ? error.message : "Interview not found"}
 />
 </AnimatedContent>
 );
 }

 const title =
 interview.job?.title ??
 (interview.candidate
 ? `${interview.candidate.firstName} ${interview.candidate.lastName}`
 : "Interview");
 const status = interview.status;
 const isInvited = status === InterviewStatus.INVITED;
 const isScheduled = status === InterviewStatus.SCHEDULED;
 const isCompleted = status === InterviewStatus.COMPLETED;

 const busy =
 accept.isPending ||
 decline.isPending ||
 join.isPending ||
 cancel.isPending ||
 complete.isPending ||
 requestReschedule.isPending ||
 reschedule.isPending;

 const generateMeetLink = () => {
 addMeetLink.mutate(
 { id: interview.id },
 {
 onSuccess: () => toast.success("Google Meet link created"),
 onError: (err) =>
 toast.error(
 err instanceof Error ? err.message : "Failed to create Meet link"
 ),
 }
 );
 };

 const openNoteDialog = (next: typeof dialog) => {
 setConfirmNote("");
 setDialog(next);
 };

 const runAction = (
 action: ReturnType<typeof useInterviewAction>,
 label: string,
 note?: string
 ) => {
 action.mutate(
 { id: interview.id, note },
 {
 onSuccess: () => {
 toast.success(label);
 setDialog(null);
 setConfirmNote("");
 },
 onError: (err) =>
 toast.error(err instanceof Error ? err.message : "Action failed"),
 }
 );
 };

 const applyAdminStatus = () => {
 if (!statusDraft || statusDraft === status) return;
 updateStatus.mutate(
 { id: interview.id, data: { toStatus: statusDraft } },
 {
 onSuccess: () => {
 toast.success("Interview updated");
 setStatusDraft("");
 },
 onError: (err) =>
 toast.error(err instanceof Error ? err.message : "Update failed"),
 }
 );
 };

 return (
 <AnimatedContent className="mx-auto max-w-3xl space-y-6">
 <Link
 href="/interviews"
 className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
 >
 Back to interviews
 </Link>

 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 {formatInterviewDate(interview.scheduledAt, interview.timezone)}
 </p>
 </div>
 <InterviewStatusBadge status={status} />
 </div>

 <CounterpartyCard interview={interview} />
 <DetailCard interview={interview} />

 {isScheduled && <CalendarLinksCard interview={interview} />}

 <div className=" border border-border/15 p-5">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
 Actions
 </h2>
 <div className="mt-3 flex flex-wrap gap-2">
 {isTalent && isInvited && (
 <>
 <Button onClick={() => openNoteDialog("accept")} disabled={busy}>
 <CheckCircle2 className="h-4 w-4" />
 Accept invitation
 </Button>
 <Button
 variant="outline"
 className="text-destructive hover:text-destructive"
 onClick={() => openNoteDialog("decline")}
 disabled={busy}
 >
 Decline
 </Button>
 </>
 )}
 {isClient && (isInvited || isScheduled) && (
 <>
 {!interview.meetingLink && (
 <Button
 variant="outline"
 onClick={generateMeetLink}
 disabled={addMeetLink.isPending || busy}
 >
 {addMeetLink.isPending ? (
 <LoaderCircle className="h-4 w-4 animate-spin" />
 ) : (
 <Video className="h-4 w-4" />
 )}
 Generate Meet link
 </Button>
 )}
 <Button
 variant="outline"
 onClick={() => openNoteDialog("join")}
 disabled={busy}
 >
 <Users className="h-4 w-4" />
 Join as interviewer
 </Button>
 <Button
 variant="outline"
 onClick={() => setRescheduleMode("request")}
 disabled={busy}
 >
 <CalendarDays className="h-4 w-4" />
 Request reschedule
 </Button>
 </>
 )}
 {isClient && isScheduled && (
 <>
 {interview.proposedRescheduleAt && (
 <Button
 variant="outline"
 onClick={() => setRescheduleMode("confirm")}
 disabled={busy}
 >
 <Clock className="h-4 w-4" />
 Confirm new time
 </Button>
 )}
 <Button variant="outline" onClick={() => openNoteDialog("complete")} disabled={busy}>
 Complete
 </Button>
 <Button
 variant="outline"
 className="text-destructive hover:text-destructive"
 onClick={() => openNoteDialog("cancel")}
 disabled={busy}
 >
 Cancel
 </Button>
 </>
 )}
 {isClient && isCompleted && interview.rating == null && (
 <Button onClick={() => setFeedbackOpen(true)} disabled={busy}>
 <Star className="h-4 w-4" />
 Submit feedback
 </Button>
 )}
 {isAdmin && (
 <div className="flex flex-wrap items-end gap-2">
 <FormSelect
 label="Status"
 value={statusDraft || status}
 onValueChange={(value) => setStatusDraft(value as InterviewStatus | "")}
 options={INTERVIEW_STATUSES}
 className="min-w-44"
 />
 <Button
 onClick={applyAdminStatus}
 disabled={
 updateStatus.isPending ||
 !statusDraft ||
 statusDraft === status
 }
 >
 {updateStatus.isPending && (
 <LoaderCircle className="h-4 w-4 animate-spin" />
 )}
 Update status
 </Button>
 </div>
 )}
 </div>
 </div>

 <ParticipantsCard interview={interview} />
 <TimelineCard interview={interview} />

 <NoteDialog
 open={dialog === "accept"}
 onOpenChange={(open) => !open && setDialog(null)}
 title="Accept interview invitation"
 description="Confirm you can make this interview."
 confirmLabel="Accept invitation"
 note={confirmNote}
 onNoteChange={setConfirmNote}
 busy={busy}
 onConfirm={() => runAction(accept, "Invitation accepted", confirmNote.trim() || undefined)}
 />
 <NoteDialog
 open={dialog === "decline"}
 onOpenChange={(open) => !open && setDialog(null)}
 title="Decline interview invitation"
 description="The client will be notified of your response."
 confirmLabel="Decline invitation"
 confirmVariant="destructive"
 note={confirmNote}
 onNoteChange={setConfirmNote}
 busy={busy}
 onConfirm={() => runAction(decline, "Invitation declined", confirmNote.trim() || undefined)}
 />
 <NoteDialog
 open={dialog === "join"}
 onOpenChange={(open) => !open && setDialog(null)}
 title="Join as interviewer"
 description="Add yourself to this interview's panel."
 confirmLabel="Join interview"
 note={confirmNote}
 onNoteChange={setConfirmNote}
 busy={busy}
 onConfirm={() => runAction(join, "You joined the interview", confirmNote.trim() || undefined)}
 />
 <NoteDialog
 open={dialog === "complete"}
 onOpenChange={(open) => !open && setDialog(null)}
 title="Complete interview"
 description="Mark this interview as completed."
 confirmLabel="Complete interview"
 note={confirmNote}
 onNoteChange={setConfirmNote}
 busy={busy}
 onConfirm={() => runAction(complete, "Interview completed", confirmNote.trim() || undefined)}
 />
 <NoteDialog
 open={dialog === "cancel"}
 onOpenChange={(open) => !open && setDialog(null)}
 title="Cancel interview"
 description="This cancels the interview for everyone involved."
 confirmLabel="Cancel interview"
 confirmVariant="destructive"
 note={confirmNote}
 onNoteChange={setConfirmNote}
 busy={busy}
 onConfirm={() => runAction(cancel, "Interview cancelled", confirmNote.trim() || undefined)}
 />

 <RescheduleDialog
 open={rescheduleMode === "request"}
 onOpenChange={(open) => !open && setRescheduleMode(null)}
 mode="request"
 busy={busy}
 onRequest={(proposedAt, note) =>
 requestReschedule.mutate(
 { id: interview.id, data: { proposedAt, note } },
 {
 onSuccess: () => {
 toast.success("Reschedule requested");
 setRescheduleMode(null);
 },
 onError: (err) =>
 toast.error(err instanceof Error ? err.message : "Request failed"),
 }
 )
 }
 />
 <RescheduleDialog
 open={rescheduleMode === "confirm"}
 onOpenChange={(open) => !open && setRescheduleMode(null)}
 mode="confirm"
 busy={busy}
 onConfirm={(scheduledAt, timezone, note) =>
 reschedule.mutate(
 { id: interview.id, data: { scheduledAt, timezone, note } },
 {
 onSuccess: () => {
 toast.success("Interview rescheduled");
 setRescheduleMode(null);
 },
 onError: (err) =>
 toast.error(err instanceof Error ? err.message : "Reschedule failed"),
 }
 )
 }
 />

 <FeedbackDialog
 open={feedbackOpen}
 onOpenChange={setFeedbackOpen}
 busy={submitFeedback.isPending}
 onSubmit={(rating, feedback) =>
 submitFeedback.mutate(
 { id: interview.id, data: { rating, feedback } },
 {
 onSuccess: () => {
 toast.success("Feedback submitted");
 setFeedbackOpen(false);
 },
 onError: (err) =>
 toast.error(err instanceof Error ? err.message : "Failed to submit feedback"),
 }
 )
 }
 />
 </AnimatedContent>
 );
}
