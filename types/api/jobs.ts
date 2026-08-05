// Jobs and applications API types

import { EmploymentType, WorkPreference } from "@/types/api/auth";

export enum JobStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
  FILLED = "filled",
  EXPIRED = "expired",
}

export enum ApplicationType {
  EASY_APPLY = "easy_apply",
  EMAIL = "email",
  EXTERNAL_LINK = "external_link",
}

export enum ApplicationStatus {
  APPLIED = "applied",
  UNDER_REVIEW = "under_review",
  SHORTLISTED = "shortlisted",
  INTERVIEW = "interview",
  OFFERED = "offered",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Job {
  id: string;
  clientProfileId: string;
  companyName?: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  employmentType: EmploymentType;
  workPreference: WorkPreference;
  location: string;
  country?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  skillsRequired: string[];
  experienceRequired?: string;
  status: JobStatus;
  applicationType: ApplicationType;
  applicationEmail?: string;
  applicationExternalUrl?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  matchScore?: number;
  matchLabel?: "Perfect Match" | "Solid Match";
}

export interface JobListData {
  jobs: Job[];
  pagination: PaginationMeta;
}

export interface SavedJob extends Job {
  savedAt: string;
}

export interface ListSavedJobsData {
  jobs: SavedJob[];
  pagination: PaginationMeta;
}

export interface SavedJobIdsData {
  ids: string[];
}

export interface StatusCountEntry {
  status: string;
  count: number;
}

export interface DailyActivityEntry {
  date: string;
  count: number;
}

export interface JobAnalyticsData {
  total_jobs: number;
  jobs_by_status: StatusCountEntry[];
  total_applications: number;
  applications_by_status: StatusCountEntry[];
  applications_chart: DailyActivityEntry[];
}

export interface ApplicationAnalyticsData {
  total_applications: number;
  applications_by_status: StatusCountEntry[];
  applications_chart: DailyActivityEntry[];
}

export interface CreateJobInput {
  title: string;
  description: string;
  category?: string;
  employmentType: EmploymentType;
  workPreference: WorkPreference;
  location: string;
  country?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  skillsRequired: string[];
  experienceRequired?: string;
  status?: JobStatus;
  applicationType?: ApplicationType;
  applicationEmail?: string;
  applicationExternalUrl?: string;
  expiresAt: string;
  signup?: JobSignupInput;
}

export interface CreateJobData extends Job {
  account_created?: boolean;
  requires_verification?: boolean;
  otp_reference?: string;
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface JobQueryParams {
  query?: string;
  category?: string;
  location?: string;
  employmentType?: EmploymentType;
  workPreference?: WorkPreference;
  experience?: string;
  sort?: "newest" | "salary";
  page?: number;
  limit?: number;
}

export interface MyJobsQueryParams {
  status?: JobStatus;
  page?: number;
  limit?: number;
}

export interface LazySignupInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  termsAccepted: boolean;
}

export interface JobSignupInput extends LazySignupInput {
  companyName: string;
}

export interface ApplySignupInput {
  password: string;
  termsAccepted: boolean;
}

export interface ApplyJobInput {
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  applicantPhone?: string;
  yearsOfExperience?: number;
  coverLetter?: string;
  proposedRate?: number;
  currency?: string;
  resumeUrl?: string;
  signup?: ApplySignupInput;
}

export interface TalentApplicationSummary {
  id: string;
  firstName: string;
  lastName: string;
  professionalTitle?: string;
  country?: string;
  skills?: string[];
  yearsOfExperience?: number;
  avatarUrl?: string;
  resumeUrl?: string;
  visibility: string;
}

export interface JobApplicationSummary {
  id: string;
  title: string;
  companyName: string;
  employmentType: EmploymentType;
  workPreference: WorkPreference;
  location: string;
  status: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

export interface ApplicationEvent {
  id: string;
  fromStatus?: string;
  toStatus: string;
  actorRole?: string;
  note?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  talentId: string;
  status: ApplicationStatus;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  yearsOfExperience?: number;
  coverLetter?: string;
  proposedRate?: number;
  currency?: string;
  clientNote?: string;
  rejectionReason?: string;
  talent?: TalentApplicationSummary;
  job?: JobApplicationSummary;
  events?: ApplicationEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListData {
  applications: Application[];
  pagination: PaginationMeta;
}

export interface ApplyJobData {
  application: Application;
  account_created?: boolean;
  otp_reference?: string;
}

export interface UpdateApplicationStatusInput {
  toStatus: ApplicationStatus;
  note?: string;
  rejectionReason?: string;
}

export interface ApplicationQueryParams {
  jobId?: string;
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}
