import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type {
  FollowUserResponseData,
  GetFollowStatusData,
} from "@/types/api/follows";

export const followKeys = {
  status: (targetUserId: string) => ["follows", "status", targetUserId] as const,
};

export function useFollowStatus(targetUserId: string, enabled = true) {
  return useQuery({
    queryKey: followKeys.status(targetUserId),
    enabled: enabled && Boolean(targetUserId),
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<GetFollowStatusData>(
        `/follows/status/${targetUserId}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load follow status");
      return res.data!;
    },
  });
}

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await worker.auth.post<FollowUserResponseData>(
        `/follows/${targetUserId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to follow");
      return res.data!;
    },
    onSuccess: (_data, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: followKeys.status(targetUserId) });
    },
  });
}

export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await worker.auth.delete<{ message: string }>(
        `/follows/${targetUserId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to unfollow");
      return res.data!;
    },
    onSuccess: (_data, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: followKeys.status(targetUserId) });
    },
  });
}
