import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  GoogleGmailAuthUrlData,
  GoogleGmailStatusData,
  GoogleGmailMessagesResult,
  GmailMessageDetails,
} from "@/types/api/google";

export function useGoogleGmailStatus() {
  return useQuery({
    queryKey: queryKeys.googleGmail.status(),
    queryFn: async () => {
      const res = await api.auth.get<GoogleGmailStatusData>("/google-gmail/status");
      if (!res.success)
        throw new Error(res.message || "Failed to load Google Gmail status");
      return res.data!;
    },
  });
}

export function useConnectGoogleGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.auth.get<GoogleGmailAuthUrlData>("/google-gmail/auth-url");
      if (!res.success)
        throw new Error(res.message || "Failed to start Google Gmail connection");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.googleGmail.all });
    },
  });
}

export function useDisconnectGoogleGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.auth.post<{ connected: boolean }>("/google-gmail/disconnect", {});
      if (!res.success)
        throw new Error(res.message || "Failed to disconnect Google Gmail");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.googleGmail.all });
    },
  });
}

export function useGmailMessages(
  query: string,
  maxResults = 20,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.googleGmail.messages(query, maxResults),
    queryFn: async () => {
      const res = await api.auth.get<GoogleGmailMessagesResult>(
        `/google-gmail/messages?query=${encodeURIComponent(query)}&maxResults=${maxResults}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load Gmail messages");
      return res.data!;
    },
    enabled: enabled && query !== undefined,
  });
}

export function useGmailMessageDetails(messageId: string) {
  return useQuery({
    queryKey: queryKeys.googleGmail.message(messageId),
    queryFn: async () => {
      const res = await api.auth.get<{ message: GmailMessageDetails }>(
        `/google-gmail/messages/${messageId}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load Gmail message details");
      return res.data!;
    },
    enabled: !!messageId,
  });
}