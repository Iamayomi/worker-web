"use client";

import Link from "next/link";
import {
 CalendarClock,
 CalendarDays,
 Clock,
 Users,
 Video,
} from "lucide-react";
import type { InterviewData } from "@/types/api/interviews";
import { VideoProvider } from "@/types/api/interviews";
import { interviewTypeLabel, formatInterviewDate } from "./format";
import { InterviewStatusBadge } from "./interview-status-badge";

export function InterviewCard({ interview }: { interview: InterviewData }) {
 const title =
 interview.job?.title ??
 (interview.candidate
 ? `${interview.candidate.firstName} ${interview.candidate.lastName}`
 : "Interview");
 const subtitle = interview.job?.companyName ?? interview.candidate?.professionalTitle ?? "";
 const rsvpCount = interview.participants?.length ?? 0;
 const rescheduling =
 interview.proposedRescheduleAt && interview.status === "scheduled";

 return (
 <Link
 href={`/interviews/${interview.id}`}
 className="group block border border-border/15 p-4 transition-colors hover:border-border/30"
 >
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div className="min-w-0">
 <span className="block text-sm font-medium transition-colors group-hover:text-primary group-hover:underline">
 {title}
 </span>
 {subtitle && (
 <span className="mt-0.5 block text-xs text-muted-foreground">
 {subtitle}
 </span>
 )}
 </div>
 <InterviewStatusBadge status={interview.status} />
 </div>

 <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
 <span className="inline-flex items-center gap-1.5">
 <CalendarClock className="h-3.5 w-3.5" />
 {formatInterviewDate(interview.scheduledAt, interview.timezone)}
 </span>
 <span className="inline-flex items-center gap-1.5">
 <Clock className="h-3.5 w-3.5" />
 {interview.durationMinutes} min · {interviewTypeLabel(interview.type)}
 </span>
 {rsvpCount > 0 && (
 <span className="inline-flex items-center gap-1.5">
 <Users className="h-3.5 w-3.5" />
 {rsvpCount} participant{rsvpCount === 1 ? "" : "s"}
 </span>
 )}
 {interview.meetingLink && (
 <span className="inline-flex items-center gap-1.5">
 <Video className="h-3.5 w-3.5" />
 {interview.videoProvider === VideoProvider.GOOGLE_MEET
 ? "Google Meet"
 : "Video"}
 </span>
 )}
 {rescheduling && (
 <span className="inline-flex items-center gap-1.5 text-amber-600">
 <CalendarDays className="h-3.5 w-3.5" />
 Reschedule requested
 </span>
 )}
 </div>
 </Link>
 );
}
