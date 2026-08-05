import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type {
  NotificationData,
  NotificationPreferences,
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

