"use client";

import { useMemo, useState } from "react";
import {
  useFraudSignals,
  useFraudRiskScore,
  useReviewFraudSignal,
} from "@/lib/hooks/use-safety";
import type {
  FraudSignalData,
  FraudSignalStatus,
  FraudRiskScoreData,
} from "@/lib/hooks/use-safety";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Textarea } from "@/components/ui/textarea";
import { SafetySubNav } from "@/components/admin/safety-sub-nav";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Pagination } from "@/components/shared/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert } from "lucide-react";

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-600",
  medium: "bg-yellow-500/10 text-yellow-600",
  high: "bg-orange-500/10 text-orange-600",
  critical: "bg-red-500/10 text-red-600",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600",
  reviewed: "bg-green-500/10 text-green-600",
  dismissed: "bg-gray-500/10 text-gray-600",
};

const SIGNAL_TYPES: { value: string; label: string }[] = [
  { value: "multiple_accounts", label: "Multiple accounts" },
  { value: "suspicious_login", label: "Suspicious login" },
  { value: "new_device", label: "New device" },
  { value: "velocity", label: "Velocity" },
  { value: "ip_mismatch", label: "IP mismatch" },
  { value: "proxy_vpn", label: "Proxy/VPN" },
  { value: "bulk_action", label: "Bulk action" },
];

const SEVERITIES: { value: string; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const REVIEW_STATUSES: { value: string; label: string }[] = [
  { value: "reviewed", label: "Mark reviewed" },
  { value: "dismissed", label: "Dismiss" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function RiskPanel({ risk }: { risk: FraudRiskScoreData }) {
  const breakdown = Object.entries(risk.breakdown).sort(([, a], [, b]) => b - a);
  const top = breakdown[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-xs font-medium text-muted-foreground">Risk score</div>
          <div className="mt-1 text-2xl font-bold">{risk.riskScore}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs font-medium text-muted-foreground">Level</div>
          <div className="mt-2">
            <Badge className={SEVERITY_STYLES[risk.riskLevel]}>
              {risk.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs font-medium text-muted-foreground">Open signals</div>
          <div className="mt-1 text-2xl font-bold">{risk.openSignals}</div>
        </div>
      </div>
      {top && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <span className="font-medium">Top contributor: </span>
          {top[0].replace(/_/g, " ")} ({top[1]} pts)
        </div>
      )}
    </div>
  );
}

export default function AdminFraudPage() {
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [signalType, setSignalType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useFraudSignals({
    status,
    severity,
    signalType,
    page,
  });
  const reviewSignal = useReviewFraudSignal();
  const riskScore = useFraudRiskScore();

  const [selected, setSelected] = useState<FraudSignalData | null>(null);
  const [reviewStatus, setReviewStatus] = useState<FraudSignalStatus>("reviewed");
  const [adminNote, setAdminNote] = useState("");
  const [riskFor, setRiskFor] = useState<FraudSignalData | null>(null);

  const signals = useMemo(() => data?.signals ?? [], [data]);
  const pagination = data?.pagination;
  const stats = data?.stats;

  const openReview = (signal: FraudSignalData) => {
    setSelected(signal);
    setReviewStatus(signal.status === "open" ? "reviewed" : signal.status);
    setAdminNote("");
  };

  const confirmReview = () => {
    if (!selected) return;
    reviewSignal.mutate(
      {
        signalId: selected.id,
        status: reviewStatus,
        adminNote: adminNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelected(null);
          setAdminNote("");
        },
      }
    );
  };

  const openRisk = (signal: FraudSignalData) => {
    setRiskFor(signal);
    riskScore.mutate(signal.user_id);
  };

  return (
    <AnimatedContent>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fraud detection</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automated signals flagged by the fraud engine, with per-user risk
            scoring.
          </p>
        </div>

        <SafetySubNav />

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load fraud signals"}
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-8">
                <StatCard label="Total" value={stats.total} />
                {Object.entries(stats.byStatus).map(([key, value]) => (
                  <StatCard key={`status-${key}`} label={key} value={value} />
                ))}
                {Object.entries(stats.bySeverity).map(([key, value]) => (
                  <StatCard key={`severity-${key}`} label={key} value={value} />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-end gap-3">
              <FormSelect
                label="Status"
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={[
                  { value: "open", label: "Open" },
                  { value: "reviewed", label: "Reviewed" },
                  { value: "dismissed", label: "Dismissed" },
                ]}
                placeholder="All statuses"
                className="w-40"
              />
              <FormSelect
                label="Severity"
                value={severity}
                onValueChange={(value) => {
                  setSeverity(value);
                  setPage(1);
                }}
                options={SEVERITIES}
                placeholder="All severities"
                className="w-40"
              />
              <FormSelect
                label="Signal type"
                value={signalType}
                onValueChange={(value) => {
                  setSignalType(value);
                  setPage(1);
                }}
                options={SIGNAL_TYPES}
                placeholder="All types"
                className="w-52"
              />
            </div>

            {signals.length === 0 ? (
              <div className="rounded-lg border bg-card">
                <EmptyState
                  icon={ShieldAlert}
                  title="No fraud signals"
                  description="No fraud signals match the current filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-card">
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Signal type</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {signals.map((signal) => (
                      <tr key={signal.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3">
                          <div className="font-medium">{signal.user_email ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {signal.user_id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {signal.signal_type.replace(/_/g, " ")}
                          </Badge>
                          {signal.description && (
                            <div className="mt-1 line-clamp-2 max-w-[220px] text-xs text-muted-foreground">
                              {signal.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={SEVERITY_STYLES[signal.severity]}>
                            {signal.severity.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_STYLES[signal.status]}>
                            {signal.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(signal.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRisk(signal)}
                            >
                              Risk
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReview(signal)}
                            >
                              Review
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            )}
          </>
        )}

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review fraud signal</DialogTitle>
              <DialogDescription>
                {selected
                  ? `${selected.user_email ?? "Unknown"} was flagged for ${
                      selected.signal_type.replace(/_/g, " ")
                    } on ${formatDate(selected.created_at)}.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                {selected.description && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    {selected.description}
                  </div>
                )}
                <FormSelect
                  label="Status"
                  value={reviewStatus}
                  onValueChange={(value) => setReviewStatus(value as FraudSignalStatus)}
                  options={REVIEW_STATUSES}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Admin note</label>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Notes on the review (visible to auditors)"
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button onClick={confirmReview} disabled={reviewSignal.isPending}>
                {reviewSignal.isPending ? "Saving..." : "Save review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!riskFor} onOpenChange={(open) => !open && setRiskFor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Risk score</DialogTitle>
              <DialogDescription>
                {riskFor
                  ? `Aggregate fraud risk for ${riskFor.user_email ?? riskFor.user_id}.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            {riskScore.isPending ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Computing risk score...
              </div>
            ) : riskScore.isError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {riskScore.error instanceof Error
                  ? riskScore.error.message
                  : "Failed to compute risk score"}
              </div>
            ) : riskScore.data ? (
              <RiskPanel risk={riskScore.data} />
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRiskFor(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedContent>
  );
}
