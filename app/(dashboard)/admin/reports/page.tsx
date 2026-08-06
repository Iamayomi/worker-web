"use client";

import { useMemo, useState } from "react";
import { useReports, useReviewReport, REPORT_REASONS } from "@/lib/hooks/use-safety";
import type { ReportAction, ReportStatus } from "@/lib/hooks/use-safety";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { SafetySubNav } from "@/components/admin/safety-sub-nav";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Inbox } from "lucide-react";
import type { ReportData } from "@/lib/hooks/use-safety";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  under_review: "bg-blue-500/10 text-blue-600",
  resolved: "bg-green-500/10 text-green-600",
  dismissed: "bg-gray-500/10 text-gray-600",
};

const ACTION_STYLES: Record<string, string> = {
  none: "bg-gray-500/10 text-gray-600",
  warning: "bg-yellow-500/10 text-yellow-600",
  suspension: "bg-orange-500/10 text-orange-600",
  ban: "bg-red-500/10 text-red-600",
};

const REPORT_STATUSES: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const REPORT_ACTIONS: { value: string; label: string }[] = [
  { value: "none", label: "No action" },
  { value: "warning", label: "Warning" },
  { value: "suspension", label: "Suspension" },
  { value: "ban", label: "Ban" },
];

const REVIEW_STATUSES: { value: string; label: string }[] = [
  { value: "under_review", label: "Mark as under review" },
  { value: "resolved", label: "Resolve" },
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

export default function AdminReportsPage() {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useReports({ status, reason, page });
  const reviewReport = useReviewReport();

  const [selected, setSelected] = useState<ReportData | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReportStatus>("under_review");
  const [reviewAction, setReviewAction] = useState<ReportAction>("none");
  const [adminNote, setAdminNote] = useState("");

  const reports = useMemo(() => data?.reports ?? [], [data]);
  const pagination = data?.pagination;
  const stats = data?.stats;

  const openReview = (report: ReportData) => {
    setSelected(report);
    setReviewStatus(report.status === "pending" ? "under_review" : report.status);
    setReviewAction(report.action_taken ?? "none");
    setAdminNote(report.admin_note ?? "");
  };

  const confirmReview = () => {
    if (!selected) return;
    reviewReport.mutate(
      {
        reportId: selected.id,
        status: reviewStatus,
        action: reviewAction,
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

  return (
    <AnimatedContent>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trust & safety</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review user reports and take action on reported accounts.
          </p>
        </div>

        <SafetySubNav />

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load reports"}
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <StatCard label="Total" value={stats.total} />
                {Object.entries(stats.byStatus).map(([key, value]) => (
                  <StatCard key={key} label={key.replace(/_/g, " ")} value={value} />
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
                options={REPORT_STATUSES}
                placeholder="All statuses"
                className="w-44"
              />
              <FormSelect
                label="Reason"
                value={reason}
                onValueChange={(value) => {
                  setReason(value);
                  setPage(1);
                }}
                options={REPORT_REASONS}
                placeholder="All reasons"
                className="w-52"
              />
            </div>

            {reports.length === 0 ? (
              <div className="rounded-lg border bg-card">
                <EmptyState
                  icon={Inbox}
                  title="No reports"
                  description="No user reports match the current filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-card">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Reporter</th>
                      <th className="px-4 py-3">Reported</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3">
                          <div className="font-medium">{report.reporter_email ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.reporter_id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{report.reported_email ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.reported_id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {report.reason.replace(/_/g, " ")}
                          </Badge>
                          {report.description && (
                            <div className="mt-1 line-clamp-2 max-w-[220px] text-xs text-muted-foreground">
                              {report.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_STYLES[report.status]}>
                            {report.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={ACTION_STYLES[report.action_taken]}>
                            {report.action_taken.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReview(report)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevious}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review report</DialogTitle>
              <DialogDescription>
                {selected
                  ? `${selected.reporter_email ?? "Unknown"} reported ${selected.reported_email ?? "unknown"} for ${selected.reason.replace(/_/g, " ")}.`
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
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Status"
                    value={reviewStatus}
                    onValueChange={(value) => setReviewStatus(value as ReportStatus)}
                    options={REVIEW_STATUSES}
                  />
                  <FormSelect
                    label="Action on account"
                    value={reviewAction}
                    onValueChange={(value) => setReviewAction(value as ReportAction)}
                    options={REPORT_ACTIONS}
                  />
                </div>
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
              <Button
                onClick={confirmReview}
                disabled={reviewReport.isPending}
              >
                {reviewReport.isPending ? "Saving..." : "Save review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedContent>
  );
}
