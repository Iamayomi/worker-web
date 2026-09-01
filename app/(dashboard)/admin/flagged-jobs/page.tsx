"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Shield, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
 useFlaggedJobs,
 useJobRiskStats,
 useReviewJobRisk,
 useRecheckJobRisk,
} from "@/lib/hooks/use-job-risk";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";
import { RiskLevelBadge } from "@/components/admin/job-risk-badge";
import {
 SIGNAL_LABELS,
 SIGNAL_SEVERITY_STYLES,
 type JobRiskAssessment,
 type JobRiskSignalType,
 type JobRiskSeverity,
} from "@/types/api/job-risk";

function formatDate(value?: string): string {
 if (!value) return "—";
 return new Date(value).toLocaleDateString();
}

const STATUS_LABELS: Record<string, string> = {
 review_required: "Review required",
 blocked: "Blocked",
 pass: "Passed",
};

const STATUS_STYLES: Record<string, string> = {
 review_required: "bg-yellow-500/10 text-yellow-600",
 blocked: "bg-destructive/10 text-destructive",
 pass: "bg-green-500/10 text-green-600",
};

function SignalChip({
 type,
 severity,
}: {
 type: JobRiskSignalType;
 severity: JobRiskSeverity;
}) {
 return (
 <span
 className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${SIGNAL_SEVERITY_STYLES[severity]}`}
 >
 {SIGNAL_LABELS[type] ?? type}
 </span>
 );
}

function FlaggedJobRow({
 assessment,
 onRefresh,
 onBlock,
 onPass,
}: {
 assessment: JobRiskAssessment;
 onRefresh: () => void;
 onBlock: () => void;
 onPass: () => void;
}) {
 const [expanded, setExpanded] = useState(false);

 return (
 <div className="border-b border-border/50 p-4 last:border-b-0">
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold">
 Job · {assessment.jobId.slice(0, 8)}
 </span>
 <RiskLevelBadge level={assessment.riskLevel} score={assessment.riskScore} />
 <span
 className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
 STATUS_STYLES[assessment.status] ?? ""
 }`}
 >
 {STATUS_LABELS[assessment.status] ?? assessment.status}
 </span>
 </div>
 <div className="mt-2 flex flex-wrap gap-1.5">
 {assessment.signals.map((signal, i) => (
 <SignalChip key={i} type={signal.type} severity={signal.severity} />
 ))}
 {assessment.signals.length === 0 && (
 <span className="text-xs text-muted-foreground">
 No signals recorded
 </span>
 )}
 </div>
 <div className="mt-2 text-xs text-muted-foreground">
 Client {assessment.clientProfileId.slice(0, 8)} · Flags received{" "}
 {formatDate(assessment.createdAt)}
 </div>

 {expanded && (
 <div className="mt-3 space-y-2 border border-border/15 bg-muted/30 p-3">
 {assessment.signals.map((signal, i) => (
 <div key={i} className="flex items-start gap-2 text-sm">
 <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
 <div>
 <span className="font-medium">
 {SIGNAL_LABELS[signal.type] ?? signal.type}
 </span>
 <span className="text-muted-foreground"> — {signal.message}</span>
 </div>
 </div>
 ))}
 {assessment.adminNote && (
 <p className="pt-1 text-xs italic text-muted-foreground">
 Admin note: {assessment.adminNote}
 </p>
 )}
 </div>
 )}
 </div>

 <div className="flex shrink-0 flex-col items-end gap-2">
 <button
 type="button"
 onClick={() => setExpanded((v) => !v)}
 className="inline-flex h-8 items-center gap-1.5 border border-border px-3 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
 >
 {expanded ? "Hide details" : "View details"}
 </button>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={onPass}
 title="Approve this job"
 className="inline-flex h-8 items-center gap-1.5 border border-emerald-500/30 px-3 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/5"
 >
 <ShieldCheck className="h-3.5 w-3.5" />
 Approve
 </button>
 <button
 type="button"
 onClick={onBlock}
 title="Block this job"
 className="inline-flex h-8 items-center gap-1.5 border border-destructive/30 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5"
 >
 <ShieldX className="h-3.5 w-3.5" />
 Block
 </button>
 <button
 type="button"
 onClick={onRefresh}
 title="Re-run risk engine"
 className="inline-flex h-8 items-center gap-1.5 border border-border px-3 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 Recheck
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function AdminFlaggedJobsPage() {
 const { user } = useAuth();
 const isAdmin = (user?.roles ?? []).some(
 (r) => r === "super_admin" || r === "admin"
 );
 const [page, setPage] = useState(1);
 const limit = 20;

 const { data: stats } = useJobRiskStats(isAdmin);
 const { data, isLoading, isError, error } = useFlaggedJobs(
 page,
 limit,
 isAdmin
 );
 const reviewMutation = useReviewJobRisk();
 const recheckMutation = useRecheckJobRisk();

 if (!isAdmin) {
 return <ErrorAlert message="You don't have access to this page." />;
 }

 const runReview = (jobId: string, status: "pass" | "blocked") =>
 toast.promise(
 reviewMutation.mutateAsync({
 jobId,
 input: { status },
 }),
 {
 loading: "Updating…",
 success: `Job ${status === "pass" ? "approved" : "blocked"}.`,
 error: "Failed to update job risk.",
 }
 );

 const runRecheck = (jobId: string) =>
 toast.promise(recheckMutation.mutateAsync(jobId), {
 loading: "Re-running risk engine…",
 success: "Risk assessment rechecked.",
 error: "Failed to recheck job.",
 });

 const assessments = data?.assessments ?? [];
 const total = data?.total ?? 0;
 const totalPages = Math.max(1, Math.ceil(total / limit));

 return (
 <AnimatedContent className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8">
 <PageHeader
 title="Flagged jobs"
 description="Jobs flagged by the risk engine for potential scams. Review and take action."
 />

 {stats && (
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
 <StatCard
 label="Review required"
 value={stats.byStatus.review_required ?? 0}
 icon={AlertTriangle}
 />
 <StatCard
 label="Blocked"
 value={stats.byStatus.blocked ?? 0}
 icon={ShieldX}
 />
 <StatCard
 label="High risk"
 value={stats.byRiskLevel.high ?? 0}
 icon={Shield}
 />
 <StatCard
 label="Critical risk"
 value={stats.byRiskLevel.critical ?? 0}
 icon={Flame}
 />
 </div>
 )}

 {isError && (
 <ErrorAlert
 message={
 error instanceof Error ? error.message : "Failed to load flagged jobs"
 }
 />
 )}

 {isLoading ? (
 <TableSkeleton />
 ) : assessments.length === 0 ? (
 <div className=" border border-border/15">
 <EmptyState
 icon={ShieldCheck}
 title="No flagged jobs"
 description="There are no jobs currently flagged for review. Newly published jobs are checked automatically."
 />
 </div>
 ) : (
 <div className=" border border-border bg-card">
 {assessments.map((assessment) => (
 <FlaggedJobRow
 key={assessment.id}
 assessment={assessment}
 onRefresh={() => runRecheck(assessment.jobId)}
 onBlock={() => runReview(assessment.jobId, "blocked")}
 onPass={() => runReview(assessment.jobId, "pass")}
 />
 ))}
 </div>
 )}

 {totalPages > 1 && (
 <Pagination
 page={page}
 totalPages={totalPages}
 isLoading={isLoading}
 onPageChange={setPage}
 />
 )}
 </AnimatedContent>
 );
}