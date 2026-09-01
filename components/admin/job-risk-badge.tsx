import { cn } from "@/lib/utils";
import { RISK_LEVEL_STYLES, type JobRiskLevel } from "@/types/api/job-risk";

export function RiskLevelBadge({
 level,
 score,
 className,
}: {
 level: JobRiskLevel;
 score?: number;
 className?: string;
}) {
 const labels: Record<JobRiskLevel, string> = {
 none: "Clean",
 low: "Low risk",
 medium: "Medium risk",
 high: "High risk",
 critical: "Critical",
 };

 return (
 <span
 className={cn(
 "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium",
 RISK_LEVEL_STYLES[level] ?? RISK_LEVEL_STYLES.none,
 className
 )}
 >
 {labels[level] ?? "Unknown"}
 {score != null && <span className="opacity-70">· {score}</span>}
 </span>
 );
}