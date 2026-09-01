import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  CreateEmailTemplateInput,
  EmailTemplateData,
  ListEmailTemplatesData,
  PreviewEmailTemplateData,
  SendTestEmailInput,
  UpdateEmailTemplateInput,
} from "@/lib/types/email-templates";

const BASE = "/email-templates";

export interface EmailTemplateFilters {
  category?: string;
  status?: string;
  search?: string;
}

export function useEmailTemplates(filters: EmailTemplateFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: queryKeys.emailTemplates.list({
      category: filters.category,
      status: filters.status,
      search: filters.search,
    }),
    queryFn: async () => {
      const res = await api.auth.get<ListEmailTemplatesData>(`${BASE}${qs}`);
      if (!res.success)
        throw new Error(res.message || "Failed to load email templates");
      return res.data!;
    },
  });
}

export function useEmailTemplate(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.emailTemplates.detail(id ?? ""),
    enabled: !!id,
    queryFn: async () => {
      const res = await api.auth.get<EmailTemplateData>(`${BASE}/${id}`);
      if (!res.success)
        throw new Error(res.message || "Failed to load email template");
      return res.data!;
    },
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEmailTemplateInput) => {
      const res = await api.auth.post<EmailTemplateData>(BASE, input);
      if (!res.success)
        throw new Error(res.message || "Failed to create email template");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailTemplates.all,
      });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateEmailTemplateInput;
    }) => {
      const res = await api.auth.patch<EmailTemplateData>(
        `${BASE}/${id}`,
        input,
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update email template");
      return res.data!;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailTemplates.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailTemplates.detail(variables.id),
      });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.auth.delete<{ deleted: boolean }>(
        `${BASE}/${id}`,
      );
      if (!res.success)
        throw new Error(res.message || "Failed to delete email template");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailTemplates.all,
      });
    },
  });
}

export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: async ({
      id,
      variables,
    }: {
      id: string;
      variables: Record<string, string>;
    }): Promise<PreviewEmailTemplateData> => {
      const res = await api.auth.post<PreviewEmailTemplateData>(
        `${BASE}/preview`,
        { id, variables },
      );
      if (!res.success)
        throw new Error(res.message || "Failed to preview email template");
      return res.data!;
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async (input: SendTestEmailInput) => {
      const res = await api.auth.post<{ sent: boolean; message: string }>(
        `${BASE}/test-send`,
        input,
      );
      if (!res.success)
        throw new Error(res.message || "Failed to send test email");
      return res.data!;
    },
  });
}
