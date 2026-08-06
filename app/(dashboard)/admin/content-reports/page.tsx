"use client";

import { useMemo, useState } from "react";
import {
  useContentReports,
  useReviewContentReport,
  REPORT_REASONS,
} from "@/lib/hooks/use-safety";
import type {
  ContentReportData,
  ModerationAction,
  ModerationStatus,
} from "@/lib/hooks/use-safety";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
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
import { Textarea } from "@/components/ui/textarea";
import { Inbox } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  under_review: "bg-blue-500/10 text-blue-600",
  resolved: "bg-green-500/10 text-green-600",
  dismissed: "bg-gray-500/10 text-gray-600",
};

const ACTION_STYLES: Record<string, string> = {
  none: "bg-gray-500/10 text-gray-600",
  removed: "bg-red-500/10 text-red-600",
  warning: "bg-yellow-500/10 text-yellow-600",
};

const CONTENT_STATUSES: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const TARGET_TYPES: { value: string; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "page", label: "Page" },
  { value: "message", label: "Message" },
  { value: "comment", label: "Comment" },
];

const REVIEW_STATUSES: { value: string; label: string }[] = [
  { value: "under_review", label: "Mark as under review" },
  { value: "resolved", label: "Resolve" },
  { value: "dismissed", label: "Dismiss" },
];

const REVIEW_ACTIONS: { value: string; label: string }[] = [
  { value: "none", label: "No content action" },
  { value: "removed", label: "Remove content" },
  { value: "warning", label: "Warn reporter" },
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

export default function AdminContentReportsPage() {
  const [status, setStatus] = useState("");
  const [targetType, setTargetType] = useState("");
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useContentReports({
    status,
    targetType,
    reason,
    page,
  });
  const reviewReport = useReviewContentReport();

  const [selected, setSelected] = useState<ContentReportData | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ModerationStatus>("under_review");
  const [reviewAction, setReviewAction] = useState<ModerationAction>("none");
  const [adminNote, setAdminNote] = useState("");

  const reports = useMemo(() => data?.reports ?? [], [data]);
  const pagination = data?.pagination;
  const stats = data?.stats;

  const openReview = (report: ContentReportData) => {
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
          <h1 className="text-2xl font-bold tracking-tight">Content moderation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review reported content and remove policy-violating posts, pages, or
            messages.
          </p>
        </div>

        <SafetySubNav />

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load content reports"}
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
                options={CONTENT_STATUSES}
                placeholder="All statuses"
                className="w-44"
              />
              <FormSelect
                label="Content type"
                value={targetType}
                onValueChange={(value) => {
                  setTargetType(value);
                  setPage(1);
                }}
                options={TARGET_TYPES}
                placeholder="All types"
                className="w-40"
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
                  title="No content reports"
                  description="No reported content matches the current filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-card">
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Reporter</th>
                      <th className="px-4 py-3">Content</th>
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
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {report.target_type.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {report.target_id}
                            </span>
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
              <DialogTitle>Review content report</DialogTitle>
              <DialogDescription>
                {selected
                  ? `${selected.reporter_email ?? "Unknown"} reported ${
                      selected.target_type.replace(/_/g, " ")
                    } ${selected.target_id} for ${selected.reason.replace(/_/g, " ")}.`
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
                    onValueChange={(value) => setReviewStatus(value as ModerationStatus)}
                    options={REVIEW_STATUSES}
                  />
                  <FormSelect
                    label="Content action"
                    value={reviewAction}
                    onValueChange={(value) => setReviewAction(value as ModerationAction)}
                    options={REVIEW_ACTIONS}
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
              <Button onClick={confirmReview} disabled={reviewReport.isPending}>
                {reviewReport.isPending ? "Saving..." : "Save review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedContent>
  );
}
