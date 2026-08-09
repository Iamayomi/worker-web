import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  GoogleCalendarAuthUrlData,
  GoogleCalendarStatusData,
} from "@/types/api/google";

export function useGoogleCalendarStatus() {
  return useQuery({
    queryKey: queryKeys.googleCalendar.status(),
    queryFn: async () => {
      const res = await worker.auth.get<GoogleCalendarStatusData>(
        "/google-calendar/status"
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load Google Calendar status");
      return res.data!;
    },
  });
}

export function useConnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.get<GoogleCalendarAuthUrlData>(
        "/google-calendar/auth-url"
      );
      if (!res.success)
        throw new Error(res.message || "Failed to start Google connection");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.googleCalendar.all,
      });
    },
  });
}

export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await worker.auth.post<{ connected: boolean }>(
        "/google-calendar/disconnect",
        {}
      );
      if (!res.success)
        throw new Error(res.message || "Failed to disconnect Google Calendar");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.googleCalendar.all,
      });
    },
  });
}
