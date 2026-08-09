import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  AddInterviewParticipantsInput,
  InterviewCalendarData,
  InterviewData,
  InterviewNoteInput,
  InterviewQueryParams,
  ListInterviewsData,
  RequestRescheduleInput,
  RescheduleInterviewInput,
  ScheduleInterviewInput,
  SubmitFeedbackInput,
  UpdateInterviewStatusAdminInput,
} from "@/types/api/interviews";

function toQueryString(params: object): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value));
    }
  });
  return q.toString();
}

function buildUrl(path: string, params: object): string {
  const query = toQueryString(params);
  return query ? `${path}?${query}` : path;
}

export function useInterviews(params: InterviewQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.interviews.list(params),
    queryFn: async () => {
      const res = await worker.auth.get<ListInterviewsData>(
        buildUrl("/interviews", params)
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load interviews");
      return res.data!;
    },
  });
}

export function useInterview(id: string) {
  return useQuery({
    queryKey: queryKeys.interviews.detail(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await worker.auth.get<InterviewData>(`/interviews/${id}`);
      if (!res.success)
        throw new Error(res.message || "Failed to load interview");
      return res.data!;
    },
  });
}

export function useInterviewCalendar(params: InterviewQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.interviews.calendar(params),
    queryFn: async () => {
      const res = await worker.auth.get<InterviewCalendarData>(
        buildUrl("/interviews/calendar", params)
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load calendar");
      return res.data!;
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ScheduleInterviewInput) => {
      const res = await worker.auth.post<InterviewData>("/interviews", data);
      if (!res.success)
        throw new Error(res.message || "Failed to schedule interview");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}

type InterviewAction = "accept" | "decline" | "join" | "cancel" | "complete";

export function useInterviewAction(action: InterviewAction) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const body: InterviewNoteInput = note ? { note } : {};
      const res = await worker.auth.post<InterviewData>(
        `/interviews/${id}/${action}`,
        body
      );
      if (!res.success)
        throw new Error(res.message || "Action failed");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}

export function useRequestReschedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: RequestRescheduleInput;
    }) => {
      const res = await worker.auth.post<InterviewData>(
        `/interviews/${id}/reschedule/request`,
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to request reschedule");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}

export function useRescheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: RescheduleInterviewInput;
    }) => {
      const res = await worker.auth.post<InterviewData>(
        `/interviews/${id}/reschedule`,
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to reschedule interview");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}

export function useSubmitInterviewFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: SubmitFeedbackInput;
    }) => {
      const res = await worker.auth.post<InterviewData>(
        `/interviews/${id}/feedback`,
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to submit feedback");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}

export function useAddInterviewParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AddInterviewParticipantsInput;
    }) => {
      const res = await worker.auth.post<InterviewData>(
        `/interviews/${id}/participants`,
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to add participants");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}

export function useUpdateInterviewStatusAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInterviewStatusAdminInput;
    }) => {
      const res = await worker.auth.patch<InterviewData>(
        `/interviews/${id}/status`,
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update interview");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}

export function useAddMeetLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const body: InterviewNoteInput = note ? { note } : {};
      const res = await worker.auth.post<InterviewData>(
        `/interviews/${id}/meet-link`,
        body
      );
      if (!res.success)
        throw new Error(res.message || "Failed to create Meet link");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews.all });
    },
  });
}
