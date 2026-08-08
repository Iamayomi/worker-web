export const APPLICATION_STATUS: Record<string, string> = {
  applied: "bg-blue-500/10 text-blue-600",
  under_review: "bg-yellow-500/10 text-yellow-600",
  shortlisted: "bg-purple-500/10 text-purple-600",
  interview: "bg-indigo-500/10 text-indigo-600",
  offered: "bg-cyan-500/10 text-cyan-600",
  accepted: "bg-green-500/10 text-green-600",
  rejected: "bg-red-500/10 text-red-600",
  withdrawn: "bg-muted text-muted-foreground",
};

export const JOB_STATUS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-green-500/10 text-green-600",
  closed: "bg-yellow-500/10 text-yellow-600",
  filled: "bg-blue-500/10 text-blue-600",
  expired: "bg-red-500/10 text-red-600",
};

export const USER_STATUS_STYLES: Record<string, string> = {
  active: "text-green-600",
  suspended: "text-red-600",
  inactive: "text-muted-foreground",
};

