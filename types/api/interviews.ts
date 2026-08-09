// Interviews API types

export enum InterviewStatus {
  INVITED = "invited",
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum InterviewType {
  VIDEO_CALL = "video_call",
  PHONE_CALL = "phone_call",
  IN_PERSON = "in_person",
  TECHNICAL_ASSESSMENT = "technical_assessment",
}

export enum InterviewParty {
  TALENT = "talent",
  CLIENT = "client",
}

export enum InterviewRsvpStatus {
  INVITED = "invited",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export enum VideoProvider {
  GOOGLE_MEET = "google_meet",
}

export enum InterviewEventType {
  CREATED = "created",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  RESCHEDULE_REQUESTED = "reschedule_requested",
  RESCHEDULED = "rescheduled",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  FEEDBACK_SUBMITTED = "feedback_submitted",
  PARTICIPANT_ADDED = "participant_added",
  JOINED = "joined",
}

export interface InterviewParticipantSummary {
  id: string;
  firstName: string;
  lastName: string;
  professionalTitle?: string;
  companyName?: string;
  avatarUrl?: string;
  email?: string;
}

export interface InterviewParticipantData {
  id: string;
  interviewId: string;
  party: InterviewParty;
  profileId: string;
  rsvpStatus: InterviewRsvpStatus;
  note?: string;
  respondedAt?: string;
  profile?: InterviewParticipantSummary;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewJobSummary {
  id: string;
  title: string;
  companyName: string;
}

export interface InterviewCandidateSummary {
  id: string;
  firstName: string;
  lastName: string;
  professionalTitle?: string;
  avatarUrl?: string;
  email?: string;
}

export interface InterviewEventData {
  id: string;
  eventType: InterviewEventType;
  fromStatus?: InterviewStatus;
  toStatus?: InterviewStatus;
  actorRole?: string;
  note?: string;
  createdAt: string;
}

export interface CalendarLinkResult {
  googleUrl: string;
  outlookUrl: string;
  ics: string;
}

export interface InterviewData {
  id: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  candidateId: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  timezone: string;
  durationMinutes: number;
  meetingLink?: string;
  videoProvider?: VideoProvider;
  googleEventId?: string;
  location?: string;
  rating?: number;
  feedback?: string;
  rescheduleCount: number;
  proposedRescheduleAt?: string;
  rescheduleRequestedAt?: string;
  job?: InterviewJobSummary;
  candidate?: InterviewCandidateSummary;
  participants?: InterviewParticipantData[];
  events?: InterviewEventData[];
  calendar?: CalendarLinkResult;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ListInterviewsData {
  interviews: InterviewData[];
  pagination: InterviewPagination;
}

export interface InterviewCalendarData {
  interviews: InterviewData[];
  ics: string;
}

export interface InterviewQueryParams {
  status?: InterviewStatus;
  type?: InterviewType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  companyName?: string;
}

export interface ScheduleInterviewInput {
  applicationId: string;
  type: InterviewType;
  scheduledAt: string;
  timezone: string;
  durationMinutes: number;
  meetingLink?: string;
  location?: string;
  note?: string;
  candidateIds?: string[];
  interviewerIds?: string[];
  createMeetLink?: boolean;
}

export interface AddInterviewParticipantsInput {
  candidateIds?: string[];
  interviewerIds?: string[];
  note?: string;
}

export interface InterviewNoteInput {
  note?: string;
}

export interface RequestRescheduleInput {
  proposedAt: string;
  note?: string;
}

export interface RescheduleInterviewInput {
  scheduledAt: string;
  timezone?: string;
  note?: string;
}

export interface SubmitFeedbackInput {
  rating: number;
  feedback?: string;
}

export interface UpdateInterviewStatusAdminInput {
  toStatus: InterviewStatus;
  note?: string;
}
