import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type { SessionData } from "@/lib/types/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.all,
    queryFn: async () => {
      const res = await worker.auth.get<SessionData[]>("/sessions");
      if (!res.success) throw new Error(res.message || "Failed to load sessions");
      return Array.isArray(res.data) ? res.data : (res.data as any).items ?? [];
    },
  });
}

export function useRevokeSession(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.delete(`/sessions/${id}`);
      if (!res.success) throw new Error("Failed to revoke session");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sessions.all }),
  });
}

export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.delete("/sessions");
      if (!res.success) throw new Error("Failed to revoke sessions");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sessions.all }),
  });
}

