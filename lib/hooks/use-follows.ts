import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type {
  FollowUserResponseData,
  GetFollowStatusData,
  ListFollowsData,
} from "@/types/api/follows";

export const followKeys = {
  status: (targetUserId: string) => ["follows", "status", targetUserId] as const,
  followers: (userId: string) => ["follows", "users", userId, "followers"] as const,
  following: (userId: string) => ["follows", "users", userId, "following"] as const,
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

export function useUserFollowers(
  userId: string,
  page = 1,
  limit = 10,
  enabled = true
) {
  return useQuery({
    queryKey: [...followKeys.followers(userId), page, limit],
    enabled: enabled && Boolean(userId),
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<ListFollowsData>(
        `/follows/users/${userId}/followers?page=${page}&limit=${limit}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load followers");
      return (
        res.data ?? {
          follows: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        }
      );
    },
  });
}

export function useUserFollowing(
  userId: string,
  page = 1,
  limit = 10,
  enabled = true
) {
  return useQuery({
    queryKey: [...followKeys.following(userId), page, limit],
    enabled: enabled && Boolean(userId),
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<ListFollowsData>(
        `/follows/users/${userId}/following?page=${page}&limit=${limit}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load following");
      return (
        res.data ?? {
          follows: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        }
      );
    },
  });
}

export function useAdminRemoveFollower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      followerId,
    }: {
      userId: string;
      followerId: string;
    }) => {
      const res = await worker.auth.delete<{ message: string }>(
        `/follows/users/${userId}/followers/${followerId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to remove follower");
      return res.data!;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: followKeys.followers(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: followKeys.status(variables.userId),
      });
    },
  });
}

export function useMyFollowers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["follows", "me", "followers", page, limit],
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<ListFollowsData>(
        `/follows/followers?page=${page}&limit=${limit}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load followers");
      return (
        res.data ?? {
          follows: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        }
      );
    },
  });
}

export function useMyFollowing(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["follows", "me", "following", page, limit],
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<ListFollowsData>(
        `/follows/following?page=${page}&limit=${limit}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load following");
      return (
        res.data ?? {
          follows: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        }
      );
    },
  });
}
