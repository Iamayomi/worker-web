import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type { NotificationData } from "@/lib/types/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const res = await worker.auth.get<{ items: NotificationData[] }>("/notifications");
      if (!res.success) throw new Error(res.message || "Failed to load notifications");
      return res.data!.items ?? (res.data as unknown as NotificationData[]);
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await worker.auth.get<{ count: number }>("/notifications/unread-count");
      if (!res.success) return 0;
      return (res.data as any).count ?? 0;
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

