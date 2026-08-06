"use client";

import { useMemo, useState } from "react";
import { useAuditLogs } from "@/lib/hooks/use-safety";
import type { AuditLogData } from "@/lib/hooks/use-safety";
import { Badge } from "@/components/ui/badge";
import { FormSelect } from "@/components/ui/form-select";
import { FormInput } from "@/components/ui/form-input";
import { SafetySubNav } from "@/components/admin/safety-sub-nav";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Pagination } from "@/components/shared/pagination";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { ScrollText } from "lucide-react";
import { worker } from "@/lib/api/worker";
import { fetchAllPages, assertSuccess } from "@/lib/utils/export-all";
import type { ListAuditLogsData } from "@/lib/hooks/use-safety";

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-gray-500/10 text-gray-600",
  warning: "bg-yellow-500/10 text-yellow-600",
  critical: "bg-red-500/10 text-red-600",
};

const ACTIONS: { value: string; label: string }[] = [
  { value: "user_reported", label: "User reported" },
  { value: "report_reviewed", label: "Report reviewed" },
  { value: "user_blocked", label: "User blocked" },
  { value: "user_unblocked", label: "User unblocked" },
  { value: "user_suspended", label: "User suspended" },
  { value: "user_activated", label: "User activated" },
  { value: "user_banned", label: "User banned" },
  { value: "content_reported", label: "Content reported" },
  { value: "content_reviewed", label: "Content reviewed" },
  { value: "content_removed", label: "Content removed" },
  { value: "fraud_signal_reviewed", label: "Fraud signal reviewed" },
  { value: "accounts_merged", label: "Accounts merged" },
];

const TARGET_TYPES: { value: string; label: string }[] = [
  { value: "user", label: "User" },
  { value: "report", label: "Report" },
  { value: "block", label: "Block" },
  { value: "content", label: "Content" },
  { value: "message", label: "Message" },
  { value: "fraud_signal", label: "Fraud signal" },
  { value: "account", label: "Account" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAuditLogsPage() {
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [severity, setSeverity] = useState("");
  const [actorEmail, setActorEmail] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useAuditLogs({
    action,
    targetType,
    severity,
    actorEmail: actorEmail.trim() || undefined,
    page,
  });

  const logs = useMemo(() => data?.logs ?? [], [data]);
  const pagination = data?.pagination;

  const fetchAllRows = async () => {
    const all = await fetchAllPages(async (p, l) => {
      const params = new URLSearchParams({ page: String(p), limit: String(l) });
      if (action) params.set("action", action);
      if (targetType) params.set("targetType", targetType);
      if (severity) params.set("severity", severity);
      if (actorEmail.trim()) params.set("actorEmail", actorEmail.trim());
      const res = await worker.auth.get<ListAuditLogsData>(`/safety/audit-logs?${params}`);
      assertSuccess(res);
      return {
        items: res.data!.logs ?? [],
        total: res.data!.pagination.total,
      };
    });
    return all.map((log) => [
      log.actor_email ?? "",
      log.action,
      log.target_type,
      log.target_id ?? "",
      log.severity,
      log.ip_address ?? "",
      log.created_at,
    ]);
  };

  return (
    <AnimatedContent>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A trail of safety-related actions taken across the platform.
          </p>
        </div>

        <SafetySubNav />

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load audit logs"}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <FormSelect
                label="Action"
                value={action}
                onValueChange={(value) => {
                  setAction(value);
                  setPage(1);
                }}
                options={ACTIONS}
                placeholder="All actions"
                className="w-52"
              />
              <FormSelect
                label="Target"
                value={targetType}
                onValueChange={(value) => {
                  setTargetType(value);
                  setPage(1);
                }}
                options={TARGET_TYPES}
                placeholder="All targets"
                className="w-40"
              />
              <FormSelect
                label="Severity"
                value={severity}
                onValueChange={(value) => {
                  setSeverity(value);
                  setPage(1);
                }}
                options={[
                  { value: "info", label: "Info" },
                  { value: "warning", label: "Warning" },
                  { value: "critical", label: "Critical" },
                ]}
                placeholder="All severities"
                className="w-40"
              />
              <FormInput
                label="Actor email"
                value={actorEmail}
                onChange={(e) => {
                  setActorEmail(e.target.value);
                  setPage(1);
                }}
                placeholder="admin@example.com"
                className="w-52"
              />
              <ExportCsvButton
                filename={`audit-log-${new Date().toISOString().slice(0, 10)}.csv`}
                headers={[
                  "Actor",
                  "Action",
                  "Target",
                  "Target ID",
                  "Severity",
                  "IP",
                  "Date",
                ]}
                fetchAll={fetchAllRows}
              />
            </div>

            {logs.length === 0 ? (
              <div className="rounded-lg border bg-card">
                <EmptyState
                  icon={ScrollText}
                  title="No audit entries"
                  description="No audit log entries match the current filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-card">
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">IP</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3">
                          <div className="font-medium">{log.actor_email ?? "System"}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.actor_id ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-1 line-clamp-1 max-w-[240px] font-mono text-xs text-muted-foreground">
                              {JSON.stringify(log.metadata)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {log.target_type.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {log.target_id ?? "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={SEVERITY_STYLES[log.severity]}>
                            {log.severity.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {log.ip_address ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(log.created_at)}
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
      </div>
    </AnimatedContent>
  );
}
