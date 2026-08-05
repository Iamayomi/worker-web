import { AccountType, UserRole } from "@/types/api/auth";
import {
  ApplicationStatus,
  ApplicationType,
  JobStatus,
} from "@/types/api/jobs";

export const WORK_PREFERENCES = [
  { value: "remote", label: "Remote" },
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "2-weeks", label: "2 weeks" },
  { value: "1-month", label: "1 month" },
  { value: "not-available", label: "Not available" },
] as const;

export const CURRENCIES = [
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
  { value: "kes", label: "KES" },
  { value: "ngn", label: "NGN" },
  { value: "zar", label: "ZAR" },
  { value: "ghs", label: "GHS" },
] as const;

export const JOB_STATUSES = [
  { value: JobStatus.DRAFT, label: "Draft" },
  { value: JobStatus.PUBLISHED, label: "Published" },
  { value: JobStatus.CLOSED, label: "Closed" },
  { value: JobStatus.FILLED, label: "Filled" },
  { value: JobStatus.EXPIRED, label: "Expired" },
] as const;

export const APPLICATION_TYPES = [
  {
    value: ApplicationType.EASY_APPLY,
    label: "Easy Apply",
    description: "Applicants apply in the app",
  },
  {
    value: ApplicationType.EMAIL,
    label: "Email address",
    description: "Applicants apply via email",
  },
  {
    value: ApplicationType.EXTERNAL_LINK,
    label: "External link",
    description: "Applicants apply on another website",
  },
] as const;

export const APPLICATION_STATUSES = [
  { value: ApplicationStatus.APPLIED, label: "Applied" },
  { value: ApplicationStatus.UNDER_REVIEW, label: "Under review" },
  { value: ApplicationStatus.SHORTLISTED, label: "Shortlisted" },
  { value: ApplicationStatus.INTERVIEW, label: "Interview" },
  { value: ApplicationStatus.OFFERED, label: "Offered" },
  { value: ApplicationStatus.ACCEPTED, label: "Accepted" },
  { value: ApplicationStatus.REJECTED, label: "Rejected" },
  { value: ApplicationStatus.WITHDRAWN, label: "Withdrawn" },
] as const;

export const COMPANY_SIZES = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "500+", label: "500+" },
] as const;

export const CLIENT_ROLES = [
  { value: "CLIENT_ADMIN", label: "Admin" },
  { value: "CLIENT_OWNER", label: "Owner" },
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "User",
  talent: "Talent",
  client_owner: "Client owner",
  client_admin: "Client admin",
  client_recruiter: "Client recruiter",
  super_admin: "Super admin",
  admin: "Admin",
  support: "Support",
  moderator: "Moderator",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  talent: "Talent",
  client: "Client",
  admin: "Admin",
};

export const VALID_INVITATIONS: Record<UserRole, UserRole[]> = {
  user: [],
  talent: [UserRole.USER, UserRole.TALENT],
  client_owner: [
    UserRole.USER,
    UserRole.TALENT,
    UserRole.CLIENT_ADMIN,
    UserRole.CLIENT_RECRUITER,
  ],
  client_admin: [
    UserRole.USER,
    UserRole.TALENT,
    UserRole.CLIENT_RECRUITER,
  ],
  client_recruiter: [],
  super_admin: [
    UserRole.USER,
    UserRole.TALENT,
    UserRole.CLIENT_OWNER,
    UserRole.CLIENT_ADMIN,
    UserRole.CLIENT_RECRUITER,
    UserRole.ADMIN,
    UserRole.SUPPORT,
    UserRole.MODERATOR,
  ],
  admin: [UserRole.ADMIN, UserRole.SUPPORT, UserRole.MODERATOR],
  support: [],
  moderator: [],
};

export const ACCOUNT_TYPE_ROLES: Record<AccountType, UserRole[]> = {
  talent: [UserRole.USER, UserRole.TALENT],
  client: [
    UserRole.CLIENT_OWNER,
    UserRole.CLIENT_ADMIN,
    UserRole.CLIENT_RECRUITER,
  ],
  admin: [UserRole.ADMIN, UserRole.SUPPORT, UserRole.MODERATOR],
};

export function getInviteableRoles(myRoles: UserRole[]): UserRole[] {
  const set = new Set<UserRole>();
  myRoles.forEach((role) => {
    VALID_INVITATIONS[role]?.forEach((r) => set.add(r));
  });
  return [...set];
}

export function getInviteableAccountTypes(
  myRoles: UserRole[]
): AccountType[] {
  const allowed = new Set(getInviteableRoles(myRoles));
  return (Object.keys(ACCOUNT_TYPE_ROLES) as AccountType[]).filter((accountType) =>
    ACCOUNT_TYPE_ROLES[accountType].some((role) => allowed.has(role))
  );
}

