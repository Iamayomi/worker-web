"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, Video } from "lucide-react";
import { useScheduleInterview } from "@/lib/hooks/use-interviews";
import { useMyJobs, useJobApplications } from "@/lib/hooks/use-jobs";
import { COMMON_TIMEZONES } from "./reschedule-dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { DateTimePicker } from "@/components/ui/date-time";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
 InterviewType,
 type ScheduleInterviewInput,
} from "@/types/api/interviews";

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240].map((m) => ({
 value: String(m),
 label: `${m} minutes`,
}));

interface ApplicantOption {
 id: string;
 name: string;
 title?: string;
}

export function ScheduleInterviewForm() {
 const router = useRouter();
 const params = useSearchParams();

 const [applicationId, setApplicationId] = useState(
 params.get("applicationId") ?? ""
 );
 const [jobId, setJobId] = useState(params.get("jobId") ?? "");
 const [scheduledAt, setScheduledAt] = useState<Date | undefined>(() => {
 const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
 date.setHours(10, 0, 0, 0);
 return date;
 });
 const [timezone, setTimezone] = useState(
 Intl.DateTimeFormat().resolvedOptions().timeZone
 );
 const [duration, setDuration] = useState("60");
 const [meetingLink, setMeetingLink] = useState("");
 const [createMeetLink, setCreateMeetLink] = useState(false);
 const [location, setLocation] = useState("");
 const [note, setNote] = useState("");
 const [candidateIds, setCandidateIds] = useState<string[]>([]);

 const { data: myJobsData, isLoading: jobsLoading } = useMyJobs({ limit: 50 });
 const { data: applicationsData } = useJobApplications(jobId, {}, Boolean(jobId));

 const schedule = useScheduleInterview();

 const jobs = myJobsData?.jobs ?? [];

 const applications = useMemo(
 () => applicationsData?.applications ?? [],
 [applicationsData]
 );

 const applicants: ApplicantOption[] = useMemo(() => {
 const list: ApplicantOption[] = [];
 for (const application of applications) {
 const talent = application.talent;
 if (!talent) continue;
 list.push({
 id: talent.id,
 name: `${talent.firstName} ${talent.lastName}`.trim() || "Candidate",
 title: talent.professionalTitle,
 });
 }
 return list;
 }, [applications]);

 const hasApplication = Boolean(applicationId);
 const hasJob = Boolean(jobId);

 const toggleCandidate = (id: string) => {
 setCandidateIds((current) =>
 current.includes(id)
 ? current.filter((candidateId) => candidateId !== id)
 : [...current, id]
 );
 };

 const canSubmit =
 hasApplication &&
 scheduledAt != null &&
 timezone &&
 !schedule.isPending;

 const submit = () => {
 if (!hasApplication || !scheduledAt) return;
 const payload: ScheduleInterviewInput = {
 applicationId,
 type: InterviewType.VIDEO_CALL,
 scheduledAt: scheduledAt.toISOString(),
 timezone,
 durationMinutes: Number(duration),
 meetingLink:
 createMeetLink ? undefined : meetingLink.trim() || undefined,
 createMeetLink: createMeetLink ? true : undefined,
 location: location.trim() || undefined,
 note: note.trim() || undefined,
 candidateIds: candidateIds.length ? candidateIds : undefined,
 };
 schedule.mutate(payload, {
 onSuccess: (interview) => {
 toast.success("Interview scheduled");
 router.push(`/interviews/${interview.id}`);
 },
 onError: (err) =>
 toast.error(
 err instanceof Error ? err.message : "Failed to schedule interview"
 ),
 });
 };

 return (
 <div className="space-y-5">
 <div className="grid gap-4 sm:grid-cols-2">
 {!hasJob && (
 <FormSelect
 label="Job"
 required
 value={jobId}
 onValueChange={(value) => {
 setJobId(value);
 setApplicationId("");
 setCandidateIds([]);
 }}
 options={jobs.map((job) => ({
 value: job.id,
 label: job.title,
 }))}
 placeholder={jobsLoading ? "Loading jobs…" : "Select a job"}
 />
 )}
 {hasJob && !hasApplication && (
 <FormSelect
 label="Application"
 required
 value={applicationId}
 onValueChange={(value) => {
 setApplicationId(value);
 setCandidateIds([]);
 }}
 options={applications.map((application) => {
 const name =
 application.applicantName ||
 (application.talent
 ? `${application.talent.firstName} ${application.talent.lastName}`
 : "Candidate");
 return { value: application.id, label: name };
 })}
 placeholder="Select an application"
 />
 )}
 <FormSelect
 label="Duration"
 required
 value={duration}
 onValueChange={setDuration}
 options={DURATION_OPTIONS}
 />
 <FormSelect
 label="Timezone"
 required
 value={timezone}
 onValueChange={setTimezone}
 options={COMMON_TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
 />
 </div>

 <DateTimePicker value={scheduledAt} onChange={setScheduledAt} />

 <div className="grid gap-4 sm:grid-cols-2">
 {!createMeetLink && (
 <FormInput
 label="Meeting link (optional)"
 value={meetingLink}
 onChange={(e) => setMeetingLink(e.target.value)}
 placeholder="https://meet.google.com/…"
 type="url"
 />
 )}
 <FormInput
 label="Location (optional)"
 value={location}
 onChange={(e) => setLocation(e.target.value)}
 placeholder="Room 5, Innovation Hub"
 />
 </div>

 <label className="flex cursor-pointer items-start gap-3 border border-border/15 p-3 transition-colors hover:bg-secondary">
 <Checkbox
 checked={createMeetLink}
 onCheckedChange={(checked) =>
 setCreateMeetLink(checked === true)
 }
 />
 <span className="min-w-0 space-y-0.5">
 <span className="block text-sm font-medium">
 Create a Google Meet link automatically
 </span>
 <span className="block text-xs text-muted-foreground">
 Adds the interview to your Google Calendar and shares the Meet
 link with participants. Requires Google Calendar to be connected
 in Settings.
 </span>
 </span>
 </label>

 {hasApplication && applicants.length > 0 && (
 <div className="space-y-2">
 <Label>Additional candidates (optional)</Label>
 <p className="text-xs text-muted-foreground">
 Invite other applicants of this job to the same interview.
 </p>
 <div className="max-h-56 space-y-1 overflow-y-auto border border-border/15 p-2">
 {applicants.map((applicant) => (
 <label
 key={applicant.id}
 className="flex cursor-pointer items-center gap-3 px-2 py-1.5 transition-colors hover:bg-secondary"
 >
 <Checkbox
 checked={candidateIds.includes(applicant.id)}
 onCheckedChange={() => toggleCandidate(applicant.id)}
 />
 <span className="min-w-0">
 <span className="block text-sm font-medium">
 {applicant.name}
 </span>
 {applicant.title && (
 <span className="block truncate text-xs text-muted-foreground">
 {applicant.title}
 </span>
 )}
 </span>
 </label>
 ))}
 </div>
 </div>
 )}

 <FormTextarea
 label="Note (optional)"
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="e.g. First round technical screening"
 rows={3}
 />

 <div className="flex flex-wrap items-center justify-end gap-2">
 {!hasApplication && (
 <p className="mr-auto text-sm text-muted-foreground">
 Select a job and application to enable scheduling.
 </p>
 )}
 <Button
 onClick={submit}
 disabled={!canSubmit}
 >
 {schedule.isPending ? (
 <LoaderCircle className="h-4 w-4 animate-spin" />
 ) : (
 <Video className="h-4 w-4" />
 )}
 Schedule interview
 </Button>
 </div>
 </div>
 );
}
