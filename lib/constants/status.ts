export const APPLICATION_STATUS = {
  pending: "bg-yellow-500/10 text-yellow-600",
  reviewed: "bg-blue-500/10 text-blue-600",
  shortlisted: "bg-purple-500/10 text-purple-600",
  rejected: "bg-red-500/10 text-red-600",
  accepted: "bg-green-500/10 text-green-600",
  withdrawn: "bg-muted text-muted-foreground",
} as const;

export const ACCOUNT_TYPE_STYLES: Record<string, string> = {
  talent: "bg-blue-500/10 text-blue-600",
  client: "bg-green-500/10 text-green-600",
  admin: "bg-purple-500/10 text-purple-600",
  super_admin: "bg-red-500/10 text-red-600",
};

export const USER_STATUS_STYLES: Record<string, string> = {
  active: "text-green-600",
  suspended: "text-red-600",
  inactive: "text-muted-foreground",
};

export type ApplicationStatus = keyof typeof APPLICATION_STATUS;

