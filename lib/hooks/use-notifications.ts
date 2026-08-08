import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { chatSocket } from "@/lib/chat/socket";
import type {
  NotificationData,
  NotificationPreferences,
  AdminNotificationItem,
  AdminNotificationStats,
  AdminSendNotificationInput,
} from "@/lib/types/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const res = await worker.auth.get<{ items: NotificationData[] }>("/notifications");
      if (!res.success) throw new Error(res.message || "Failed to load notifications");
      return res.data?.items ?? [];
    },
  });
}

/**
 * Keeps unread count + list fresh when the server pushes notification.created
 * events over the chat socket. Call once globally (e.g. the floating chat widget).
 */
export function useNotificationRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const off = chatSocket.on("notification.created", () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    });
    return () => off();
  }, [qc]);
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await worker.auth.get<{ unread_count: number }>(
        "/notifications/unread-count"
      );
      if (!res.success) return 0;
      return res.data?.unread_count ?? 0;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkRead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.patch(`/notifications/${id}/read`);
      if (!res.success) throw new Error("Failed to mark as read");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.patch("/notifications/read-all");
      if (!res.success) throw new Error("Failed to mark all as read");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: async () => {
      const res = await worker.auth.get<{ preferences: NotificationPreferences }>(
        "/notifications/preferences"
      );
      if (!res.success) throw new Error(res.message || "Failed to load notification preferences");
      return res.data?.preferences ?? null;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      const res = await worker.auth.patch<{ preferences: NotificationPreferences }>(
        "/notifications/preferences",
        preferences
      );
      if (!res.success) throw new Error("Failed to update notification preferences");
      return res.data?.preferences ?? preferences;
    },
    onSuccess: (preferences) => {
      qc.setQueryData(queryKeys.notifications.preferences(), preferences);
    },
  });
}

export function useAdminNotifications(
  params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    type?: string;
    userId?: string;
    q?: string;
  },
  enabled = true
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.userId) query.set("userId", params.userId);
  if (params.q) query.set("q", params.q);
  const qs = query.toString();

  return useQuery({
    queryKey: queryKeys.notifications.adminList(params),
    enabled,
    queryFn: async () => {
      const res = await worker.auth.get<{
        items: AdminNotificationItem[];
        total: number;
      }>(`/notifications/admin/all${qs ? `?${qs}` : ""}`);
      if (!res.success)
        throw new Error(res.message || "Failed to load notifications");
      return res.data ?? { items: [], total: 0 };
    },
  });
}

export function useAdminNotificationStats() {
  return useQuery({
    queryKey: queryKeys.notifications.adminStats(),
    queryFn: async () => {
      const res = await worker.auth.get<AdminNotificationStats>(
        "/notifications/admin/stats"
      );
      if (!res.success) throw new Error(res.message || "Failed to load stats");
      return res.data;
    },
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminSendNotificationInput) => {
      const res = await worker.auth.post<{ recipientCount: number }>(
        "/notifications/admin/send",
        input
      );
      if (!res.success) throw new Error(res.message || "Failed to send notification");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.adminList({}) });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.adminStats() });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete(`/notifications/admin/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to delete notification");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.adminList({}) });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.adminStats() });
    },
  });
}

