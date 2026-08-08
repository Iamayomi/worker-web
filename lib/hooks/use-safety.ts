import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";

export type ReportReason =
  | "spam"
  | "harassment"
  | "scam"
  | "inappropriate_content"
  | "other";

export type ReportStatus = "pending" | "under_review" | "resolved" | "dismissed";
export type ReportAction = "none" | "warning" | "suspension" | "ban";

export interface ReportData {
  id: string;
  reporter_id: string;
  reporter_email?: string;
  reported_id: string;
  reported_email?: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  action_taken: ReportAction;
  admin_id?: string | null;
  admin_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockData {
  id: string;
  blocker_id: string;
  blocker_email?: string;
  blocked_id: string;
  blocked_email?: string;
  reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ListReportsData {
  reports: ReportData[];
  pagination: Pagination;
  stats: { total: number; byStatus: Record<string, number> };
}

export interface ListBlocksData {
  blocks: BlockData[];
  pagination: Pagination;
}

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "scam", label: "Scam or fraud" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

export function useCreateReport() {
  return useMutation({
    mutationFn: async (data: {
      reportedId: string;
      reason: ReportReason;
      description?: string;
    }) => {
      const res = await worker.auth.post<{ report: ReportData }>(
        "/safety/reports",
        data
      );
      if (!res.success) throw new Error(res.message || "Failed to submit report");
      return res.data!;
    },
  });
}

export type ContentTargetType = "post" | "page" | "message" | "comment";

export function useCreateContentReport() {
  return useMutation({
    mutationFn: async (data: {
      targetType: ContentTargetType;
      targetId: string;
      reason: string;
      description?: string;
    }) => {
      const res = await worker.auth.post<{ report: { id: string } }>(
        "/safety/content-reports",
        data
      );
      if (!res.success) throw new Error(res.message || "Failed to submit report");
      return res.data!;
    },
  });
}

export function useReports(params?: {
  status?: string;
  reason?: string;
  action?: string;
  reportedEmail?: string;
  reporterEmail?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;
  const reason = params?.reason;
  const action = params?.action;
  const reportedEmail = params?.reportedEmail;
  const reporterEmail = params?.reporterEmail;

  return useQuery({
    queryKey: ["safety", "reports", { page, limit, status, reason, action, reportedEmail, reporterEmail }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) query.set("status", status);
      if (reason) query.set("reason", reason);
      if (action) query.set("action", action);
      if (reportedEmail) query.set("reportedEmail", reportedEmail);
      if (reporterEmail) query.set("reporterEmail", reporterEmail);
      const res = await worker.auth.get<ListReportsData>(
        `/safety/reports?${query}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load reports");
      return res.data!;
    },
  });
}

export function useReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      reportId: string;
      status: ReportStatus;
      action?: ReportAction;
      adminNote?: string;
    }) => {
      const res = await worker.auth.patch<{ report: ReportData }>(
        `/safety/reports/${data.reportId}`,
        {
          status: data.status,
          action: data.action,
          adminNote: data.adminNote,
        }
      );
      if (!res.success) throw new Error(res.message || "Failed to review report");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useBlockUser() {
  return useMutation({
    mutationFn: async (data: { blockedId: string; reason?: string }) => {
      const res = await worker.auth.post<{ block: BlockData }>(
        "/safety/blocks",
        data
      );
      if (!res.success) throw new Error(res.message || "Failed to block user");
      return res.data!;
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockedId: string) => {
      const res = await worker.auth.delete<{ block: BlockData }>(
        `/safety/blocks/${blockedId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to unblock user");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety", "blocks"] });
    },
  });
}

export function useBlockedUsers(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  return useQuery({
    queryKey: ["safety", "blocks", { page, limit }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await worker.auth.get<ListBlocksData>(
        `/safety/blocks?${query}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load blocked users");
      return res.data!;
    },
  });
}

export function useAllBlocks(params?: {
  blockerEmail?: string;
  blockedEmail?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const blockerEmail = params?.blockerEmail;
  const blockedEmail = params?.blockedEmail;

  return useQuery({
    queryKey: ["safety", "blocks", "admin", { page, limit, blockerEmail, blockedEmail }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (blockerEmail) query.set("blockerEmail", blockerEmail);
      if (blockedEmail) query.set("blockedEmail", blockedEmail);
      const res = await worker.auth.get<ListBlocksData>(
        `/safety/blocks/admin?${query}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load blocks");
      return res.data!;
    },
  });
}

export function useRemoveBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) => {
      const res = await worker.auth.delete<{ blockId: string }>(
        `/safety/blocks/admin/${blockId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to remove block");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety", "blocks"] });
    },
  });
}

// ============================================
// CONTENT MODERATION
// ============================================

export type ContentType = "post" | "page" | "message" | "comment";
export type ModerationStatus =
  | "pending"
  | "under_review"
  | "resolved"
  | "dismissed";
export type ModerationAction = "none" | "removed" | "warning";

export interface ContentReportData {
  id: string;
  reporter_id: string;
  reporter_email?: string;
  target_type: ContentType;
  target_id: string;
  reason: string;
  description?: string | null;
  status: ModerationStatus;
  action_taken: ModerationAction;
  admin_id?: string | null;
  admin_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListContentReportsData {
  reports: ContentReportData[];
  pagination: Pagination;
  stats: { total: number; byStatus: Record<string, number> };
}

export function useContentReports(params?: {
  status?: string;
  targetType?: string;
  reason?: string;
  reporterEmail?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;
  const targetType = params?.targetType;
  const reason = params?.reason;
  const reporterEmail = params?.reporterEmail;

  return useQuery({
    queryKey: ["safety", "content-reports", { page, limit, status, targetType, reason, reporterEmail }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) query.set("status", status);
      if (targetType) query.set("targetType", targetType);
      if (reason) query.set("reason", reason);
      if (reporterEmail) query.set("reporterEmail", reporterEmail);
      const res = await worker.auth.get<ListContentReportsData>(
        `/safety/content-reports?${query}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load content reports");
      return res.data!;
    },
  });
}

export function useReviewContentReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      reportId: string;
      status: ModerationStatus;
      action?: ModerationAction;
      adminNote?: string;
    }) => {
      const res = await worker.auth.patch<{ report: ContentReportData; contentRemoved: boolean }>(
        `/safety/content-reports/${data.reportId}`,
        {
          status: data.status,
          action: data.action,
          adminNote: data.adminNote,
        }
      );
      if (!res.success) throw new Error(res.message || "Failed to review content report");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety", "content-reports"] });
      queryClient.invalidateQueries({ queryKey: ["safety", "audit-logs"] });
    },
  });
}

// ============================================
// DUPLICATE ACCOUNT DETECTION
// ============================================

export type AccountLinkType = "email" | "phone" | "device" | "ip";

export interface DuplicateGroupData {
  link_type: AccountLinkType;
  link_value: string;
  users: Array<{
    id: string;
    email: string;
    status: string;
    created_at: string;
    last_login_at?: string | null;
  }>;
}

export interface DetectDuplicatesData {
  groups: DuplicateGroupData[];
  total: number;
  pagination: Pagination;
}

export function useDuplicateGroups(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery({
    queryKey: ["safety", "duplicates", { page, limit }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await worker.auth.get<DetectDuplicatesData>(
        `/safety/duplicates?${query}`
      );
      if (!res.success) throw new Error(res.message || "Failed to detect duplicates");
      return res.data!;
    },
  });
}

export function useMergeAccounts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { primaryUserId: string; duplicateUserId: string }) => {
      const res = await worker.auth.post<{
        primaryUserId: string;
        mergedUserId: string;
        email: string;
        message: string;
      }>(`/safety/duplicates/merge`, data);
      if (!res.success) throw new Error(res.message || "Failed to merge accounts");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety", "duplicates"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["safety", "audit-logs"] });
    },
  });
}

// ============================================
// FRAUD DETECTION
// ============================================

export type FraudSignalType =
  | "multiple_accounts"
  | "suspicious_login"
  | "new_device"
  | "velocity"
  | "ip_mismatch"
  | "proxy_vpn"
  | "bulk_action";
export type FraudSeverity = "low" | "medium" | "high" | "critical";
export type FraudSignalStatus = "open" | "reviewed" | "dismissed";

export interface FraudSignalData {
  id: string;
  user_id: string;
  user_email?: string;
  signal_type: FraudSignalType;
  severity: FraudSeverity;
  status: FraudSignalStatus;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  device_info?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListFraudSignalsData {
  signals: FraudSignalData[];
  pagination: Pagination;
  stats: {
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export interface FraudRiskScoreData {
  userId: string;
  riskScore: number;
  riskLevel: FraudSeverity;
  openSignals: number;
  breakdown: Record<string, number>;
}

export function useFraudSignals(params?: {
  status?: string;
  severity?: string;
  signalType?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;
  const severity = params?.severity;
  const signalType = params?.signalType;
  const userId = params?.userId;

  return useQuery({
    queryKey: ["safety", "fraud-signals", { page, limit, status, severity, signalType, userId }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) query.set("status", status);
      if (severity) query.set("severity", severity);
      if (signalType) query.set("signalType", signalType);
      if (userId) query.set("userId", userId);
      const res = await worker.auth.get<ListFraudSignalsData>(
        `/safety/fraud-signals?${query}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load fraud signals");
      return res.data!;
    },
  });
}

export function useFraudRiskScore() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await worker.auth.get<FraudRiskScoreData>(
        `/safety/fraud-signals/risk/${userId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load risk score");
      return res.data!;
    },
  });
}

export function useReviewFraudSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      signalId: string;
      status: FraudSignalStatus;
      adminNote?: string;
    }) => {
      const res = await worker.auth.patch<{ signal: FraudSignalData }>(
        `/safety/fraud-signals/${data.signalId}`,
        {
          status: data.status,
          adminNote: data.adminNote,
        }
      );
      if (!res.success) throw new Error(res.message || "Failed to review fraud signal");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety", "fraud-signals"] });
      queryClient.invalidateQueries({ queryKey: ["safety", "audit-logs"] });
    },
  });
}

// ============================================
// AUDIT LOGS
// ============================================

export type AuditAction =
  | "user_reported"
  | "report_reviewed"
  | "user_blocked"
  | "user_unblocked"
  | "user_suspended"
  | "user_activated"
  | "user_banned"
  | "content_reported"
  | "content_reviewed"
  | "content_removed"
  | "fraud_signal_reviewed"
  | "accounts_merged"
  | "login"
  | "logout"
  | "failed_login"
  | "password_reset";
export type AuditTargetType =
  | "user"
  | "report"
  | "block"
  | "content"
  | "message"
  | "fraud_signal"
  | "account";
export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogData {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: AuditAction;
  target_type: AuditTargetType;
  target_id?: string | null;
  severity: AuditSeverity;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface ListAuditLogsData {
  logs: AuditLogData[];
  pagination: Pagination;
}

export function useAuditLogs(params?: {
  actorId?: string;
  action?: string;
  targetType?: string;
  severity?: string;
  actorEmail?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  return useQuery({
    queryKey: ["safety", "audit-logs", { ...params, page, limit }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (params?.actorId) query.set("actorId", params.actorId);
      if (params?.action) query.set("action", params.action);
      if (params?.targetType) query.set("targetType", params.targetType);
      if (params?.severity) query.set("severity", params.severity);
      if (params?.actorEmail) query.set("actorEmail", params.actorEmail);
      if (params?.from) query.set("from", params.from);
      if (params?.to) query.set("to", params.to);
      const res = await worker.auth.get<ListAuditLogsData>(
        `/safety/audit-logs?${query}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load audit logs");
      return res.data!;
    },
  });
}
