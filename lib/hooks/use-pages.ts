import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import {
  type Page,
  type PageListData,
  type CreatePageInput,
  type UpdatePageInput,
} from "@/types/api/pages";
import { queryKeys } from "@/lib/api/query-keys";

export function usePageBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pages.bySlug(slug ?? ""),
    enabled: !!slug,
    queryFn: async () => {
      const res = await worker.get<Page>(`/content/pages/by-slug/${slug}`);
      if (!res.success) throw new Error(res.message || "Failed to load page");
      return res.data!;
    },
    retry: false,
  });
}

export function useAdminPages() {
  return useQuery({
    queryKey: queryKeys.pages.adminList(),
    queryFn: async () => {
      const res = await worker.auth.get<PageListData>(
        "/content/pages/admin?limit=100"
      );
      if (!res.success) throw new Error(res.message || "Failed to load pages");
      return res.data!;
    },
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePageInput) => {
      const res = await worker.auth.post<Page>("/content/pages", data);
      if (!res.success) throw new Error(res.message || "Failed to create page");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all() });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePageInput & { id: string }) => {
      const { id, ...rest } = data;
      const res = await worker.auth.patch<Page>(`/content/pages/${id}`, rest);
      if (!res.success) throw new Error(res.message || "Failed to update page");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all() });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<{ message: string }>(
        `/content/pages/${id}`
      );
      if (!res.success) throw new Error(res.message || "Failed to delete page");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all() });
    },
  });
}
