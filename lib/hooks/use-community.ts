import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { useAuthStore } from "@/store/authStore";
import {
  type CommunityResponseData,
  type ListCommunitiesData,
  type ListMembersData,
  type MembershipData,
  type PostResponseData,
  type ListPostsData,
  type LikeResponseData,
  type CommentResponseData,
  type ListCommentsData,
  type EventResponseData,
  type ListEventsData,
  type RsvpResponseData,
  type ListRsvpsData,
  type FeedData,
  type TrendingData,
  type CreateCommunityInput,
  type UpdateCommunityInput,
  type ListCommunitiesParams,
  type ListMembersParams,
  type CreateCommunityPostInput,
  type UpdateCommunityPostInput,
  type ListPostsParams,
  type CreateCommentInput,
  type ListCommentsParams,
  type CreateCommunityEventInput,
  type ListEventsParams,
  type FeedQueryParams,
} from "@/types/api/community";
import { queryKeys } from "@/lib/api/query-keys";

function buildQuery(params: object): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ============ Communities ============

export function useCommunities(params?: ListCommunitiesParams) {
  return useQuery({
    queryKey: queryKeys.community.list(params ?? {}),
    queryFn: async () => {
      const res = await worker.get<ListCommunitiesData>(
        `/communities${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load communities");
      return res.data!;
    },
  });
}

export function useMyCommunities(params?: ListCommunitiesParams) {
  return useQuery({
    queryKey: queryKeys.community.mine(params ?? {}),
    queryFn: async () => {
      const res = await worker.auth.get<ListCommunitiesData>(
        `/communities/my${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load your communities");
      return res.data!;
    },
  });
}

export function useCommunity(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.detail(id ?? ""),
    enabled: !!id,
    queryFn: async () => {
      const res = await worker.get<CommunityResponseData>(`/communities/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to load community");
      return res.data!.community;
    },
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCommunityInput) => {
      const res = await worker.auth.post<CommunityResponseData>("/communities", data);
      if (!res.success) throw new Error(res.message || "Failed to create community");
      return res.data!.community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
    },
  });
}

export function useUpdateCommunity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCommunityInput) => {
      const res = await worker.auth.patch<CommunityResponseData>(
        `/communities/${id}`,
        data,
      );
      if (!res.success) throw new Error(res.message || "Failed to update community");
      return res.data!.community;
    },
    onSuccess: (community) => {
      queryClient.setQueryData(queryKeys.community.detail(id), community);
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
    },
  });
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete(`/communities/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to delete community");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
    },
  });
}

export function useJoinCommunity(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.post<MembershipData>(
        `/communities/${communityId}/join`,
      );
      if (!res.success) throw new Error(res.message || "Failed to join community");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(communityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.mine({}) });
    },
  });
}

export function useLeaveCommunity(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.post<MembershipData>(
        `/communities/${communityId}/leave`,
      );
      if (!res.success) throw new Error(res.message || "Failed to leave community");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(communityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.mine({}) });
    },
  });
}

// ============ Members ============

export function useCommunityMembers(communityId: string, params?: ListMembersParams) {
  return useQuery({
    queryKey: queryKeys.community.members(communityId, params ?? {}),
    queryFn: async () => {
      const res = await worker.auth.get<ListMembersData>(
        `/communities/${communityId}/members${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load members");
      return res.data!;
    },
  });
}

// ============ Posts ============

export function useCommunityPosts(communityId: string, params?: ListPostsParams) {
  return useQuery({
    queryKey: queryKeys.community.posts(communityId, params ?? {}),
    queryFn: async () => {
      const res = await worker.get<ListPostsData>(
        `/communities/${communityId}/posts${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load posts");
      return res.data!;
    },
  });
}

export function useCreatePost(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCommunityPostInput) => {
      const res = await worker.auth.post<PostResponseData>(
        `/communities/${communityId}/posts`,
        data,
      );
      if (!res.success) throw new Error(res.message || "Failed to create post");
      return res.data!.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.posts(communityId, {}),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.feed({}) });
    },
  });
}

export function useUpdatePost(communityId: string, postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCommunityPostInput) => {
      const res = await worker.auth.patch<PostResponseData>(
        `/communities/${communityId}/posts/${postId}`,
        data,
      );
      if (!res.success) throw new Error(res.message || "Failed to update post");
      return res.data!.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.posts(communityId, {}),
      });
    },
  });
}

export function useDeletePost(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await worker.auth.delete(
        `/communities/${communityId}/posts/${postId}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.posts(communityId, {}),
      });
    },
  });
}

export function useLikePost(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await worker.auth.post<LikeResponseData>(
        `/communities/${communityId}/posts/${postId}/like`,
      );
      if (!res.success) throw new Error(res.message || "Failed to like post");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.posts(communityId, {}),
      });
    },
  });
}

export function useUnlikePost(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await worker.auth.post<LikeResponseData>(
        `/communities/${communityId}/posts/${postId}/unlike`,
      );
      if (!res.success) throw new Error(res.message || "Failed to unlike post");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.posts(communityId, {}),
      });
    },
  });
}

// ============ Comments ============

export function usePostComments(
  communityId: string,
  postId: string,
  params?: ListCommentsParams,
) {
  return useQuery({
    queryKey: queryKeys.community.comments(postId, params ?? {}),
    queryFn: async () => {
      const res = await worker.get<ListCommentsData>(
        `/communities/${communityId}/posts/${postId}/comments${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load comments");
      return res.data!;
    },
  });
}

export function useCreateComment(communityId: string, postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const res = await worker.auth.post<CommentResponseData>(
        `/communities/${communityId}/posts/${postId}/comments`,
        data,
      );
      if (!res.success) throw new Error(res.message || "Failed to post comment");
      return res.data!.comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.comments(postId, {}) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.posts(communityId, {}),
      });
    },
  });
}

export function useDeleteComment(communityId: string, postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await worker.auth.delete(
        `/communities/${communityId}/posts/${postId}/comments/${commentId}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.comments(postId, {}) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.posts(communityId, {}),
      });
    },
  });
}

// ============ Events ============

export function useCommunityEvents(communityId: string, params?: ListEventsParams) {
  return useQuery({
    queryKey: queryKeys.community.events(communityId, params ?? {}),
    queryFn: async () => {
      const res = await worker.get<ListEventsData>(
        `/communities/${communityId}/events${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load events");
      return res.data!;
    },
  });
}

export function useCreateEvent(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCommunityEventInput) => {
      const res = await worker.auth.post<EventResponseData>(
        `/communities/${communityId}/events`,
        data,
      );
      if (!res.success) throw new Error(res.message || "Failed to create event");
      return res.data!.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.events(communityId, {}),
      });
    },
  });
}

export function useCancelEvent(communityId: string, eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.post(
        `/communities/${communityId}/events/${eventId}/cancel`,
      );
      if (!res.success) throw new Error(res.message || "Failed to cancel event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.events(communityId, {}),
      });
    },
  });
}

export function useRsvpToEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (response: string) => {
      const res = await worker.auth.post<RsvpResponseData>(
        `/events/${eventId}/rsvp`,
        { response },
      );
      if (!res.success) throw new Error(res.message || "Failed to update RSVP");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.rsvps(eventId, {}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
    },
  });
}

export function useEventRsvps(eventId: string, params?: ListMembersParams) {
  return useQuery({
    queryKey: queryKeys.community.rsvps(eventId, params ?? {}),
    queryFn: async () => {
      const res = await worker.auth.get<ListRsvpsData>(
        `/events/${eventId}/rsvps${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load RSVPs");
      return res.data!;
    },
  });
}

// ============ Feed ============

export function useCommunityFeed(params?: FeedQueryParams) {
  return useQuery({
    queryKey: queryKeys.community.feed(params ?? {}),
    queryFn: async () => {
      const res = await worker.auth.get<FeedData>(
        `/community-feed${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load feed");
      return res.data!;
    },
  });
}

export function useTrendingPosts(params?: FeedQueryParams) {
  return useQuery({
    queryKey: queryKeys.community.trending(params ?? {}),
    queryFn: async () => {
      const res = await worker.get<TrendingData>(
        `/community-feed/trending${buildQuery(params ?? {})}`,
      );
      if (!res.success) throw new Error(res.message || "Failed to load trending posts");
      return res.data!;
    },
  });
}

// Helper: current user's id for permission checks
export function useCurrentUserId(): string | undefined {
  const userId = useAuthStore((s) => s.user?.id);
  return userId;
}
