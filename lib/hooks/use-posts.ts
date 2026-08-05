import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import {
  type Post,
  type PostListData,
  type PostQueryParams,
  type CreatePostInput,
  type UpdatePostInput,
} from "@/types/api/posts";
import { queryKeys } from "@/lib/api/query-keys";

function buildQuery(params: PostQueryParams): string {
  const q = new URLSearchParams();
  if (params.query) q.set("query", params.query);
  if (params.category) q.set("category", params.category);
  if (params.tag) q.set("tag", params.tag);
  if (params.status) q.set("status", params.status);
  if (params.sort) q.set("sort", params.sort);
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 12));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function usePosts(params?: PostQueryParams) {
  return useQuery({
    queryKey: queryKeys.content.list(params ?? {}),
    queryFn: async () => {
      const res = await worker.get<PostListData>(
        `/content/posts${buildQuery(params ?? {})}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load posts");
      return res.data!;
    },
  });
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.content.detail(slug ?? ""),
    enabled: !!slug,
    queryFn: async () => {
      const res = await worker.get<Post>(`/content/posts/by-slug/${slug}`);
      if (!res.success) throw new Error(res.message || "Failed to load post");
      return res.data!;
    },
  });
}

export function useAdminPosts(params?: PostQueryParams) {
  return useQuery({
    queryKey: queryKeys.content.adminList(params ?? {}),
    queryFn: async () => {
      const res = await worker.auth.get<PostListData>(
        `/content/posts/admin${buildQuery(params ?? {})}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load posts");
      return res.data!;
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const res = await worker.auth.post<Post>("/content/posts", data);
      if (!res.success) throw new Error(res.message || "Failed to create post");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePostInput & { id: string }) => {
      const { id, ...rest } = data;
      const res = await worker.auth.patch<Post>(
        `/content/posts/${id}`,
        rest
      );
      if (!res.success) throw new Error(res.message || "Failed to update post");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<{ message: string }>(
        `/content/posts/${id}`
      );
      if (!res.success) throw new Error(res.message || "Failed to delete post");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all() });
    },
  });
}
