import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  CreateJobAlertInput,
  JobAlertMutationData,
  ListJobAlertsData,
  UpdateJobAlertInput,
} from "@/types/api/job-alerts";

export function useJobAlerts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobAlerts.list(),
    queryFn: async () => {
      const res = await api.auth.get<ListJobAlertsData>("/job-alerts");
      if (!res.success) throw new Error(res.message || "Failed to load job alerts");
      return res.data!;
    },
    enabled,
  });
}

export function useCreateJobAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateJobAlertInput) => {
      const res = await api.auth.post<JobAlertMutationData>("/job-alerts", input);
      if (!res.success) throw new Error(res.message || "Failed to create job alert");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.all });
    },
  });
}

export function useUpdateJobAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alertId,
      input,
    }: {
      alertId: string;
      input: UpdateJobAlertInput;
    }) => {
      const res = await api.auth.patch<JobAlertMutationData>(
        `/job-alerts/${alertId}`,
        input
      );
      if (!res.success) throw new Error(res.message || "Failed to update job alert");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.all });
    },
  });
}

export function useDeleteJobAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const res = await api.auth.delete<{ deleted: boolean }>(
        `/job-alerts/${alertId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to delete job alert");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.all });
    },
  });
}