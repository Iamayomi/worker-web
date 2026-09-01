export type JobRiskSignalType =
  | "unrealistic_salary"
  | "suspicious_link"
  | "money_request"
  | "unverified_employer"
  | "duplicate_posting"
  | "suspicious_description"
  | "fake_company"
  | "velocity_breach"
  | "suspicious_title"
  | "missing_requirements";

export type JobRiskSeverity = "low" | "medium" | "high" | "critical";

export type JobRiskLevel = "none" | "low" | "medium" | "high" | "critical";

export type JobRiskStatus = "pass" | "review_required" | "blocked";

export interface JobRiskSignal {
  type: JobRiskSignalType;
  severity: JobRiskSeverity;
  weight: number;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface JobRiskAssessment {
  id: string;
  jobId: string;
  clientProfileId: string;
  riskScore: number;
  riskLevel: JobRiskLevel;
  status: JobRiskStatus;
  signals: JobRiskSignal[];
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListFlaggedJobsData {
  assessments: JobRiskAssessment[];
  total: number;
}

export interface JobRiskStats {
  byStatus: Record<string, number>;
  byRiskLevel: Record<string, number>;
}

export interface ReviewJobRiskInput {
  status: "pass" | "blocked";
  adminNote?: string;
}

export const RISK_LEVEL_STYLES: Record<JobRiskLevel, string> = {
  none: "bg-green-500/10 text-green-600",
  low: "bg-emerald-500/10 text-emerald-600",
  medium: "bg-yellow-500/10 text-yellow-600",
  high: "bg-orange-500/10 text-orange-600",
  critical: "bg-red-500/10 text-red-600",
};

export const SIGNAL_LABELS: Record<JobRiskSignalType, string> = {
  unrealistic_salary: "Unrealistic salary",
  suspicious_link: "Suspicious link",
  money_request: "Requests money",
  unverified_employer: "Unverified employer",
  duplicate_posting: "Duplicate posting",
  suspicious_description: "Suspicious description",
  fake_company: "Fake company",
  velocity_breach: "Posting velocity",
  suspicious_title: "Suspicious title",
  missing_requirements: "Missing requirements",
};

export const SIGNAL_SEVERITY_STYLES: Record<JobRiskSeverity, string> = {
  low: "bg-slate-500/10 text-slate-600",
  medium: "bg-yellow-500/10 text-yellow-600",
  high: "bg-orange-500/10 text-orange-600",
  critical: "bg-red-500/10 text-red-600",
};