import { AccountType, UserRole } from "@/types/api/auth";

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
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "KES", label: "KES" },
  { value: "NGN", label: "NGN" },
  { value: "ZAR", label: "ZAR" },
  { value: "GHS", label: "GHS" },
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

