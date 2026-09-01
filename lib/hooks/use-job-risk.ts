import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import type {
  JobRiskAssessment,
  JobRiskStats,
  ReviewJobRiskInput,
  ListFlaggedJobsData,
} from "@/types/api/job-risk";

export function useFlaggedJobs(
  page: number,
  limit: number,
  enabled = true
) {
  return useQuery({
    queryKey: ["job-risk", "flagged", { page, limit }],
    queryFn: async () => {
      const res = await api.auth.get<ListFlaggedJobsData>(
        `/admin/jobs/flagged?page=${page}&limit=${limit}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load flagged jobs");
      return res.data!;
    },
    enabled,
  });
}

export function useJobRiskStats(enabled = true) {
  return useQuery({
    queryKey: ["job-risk", "stats"],
    queryFn: async () => {
      const res = await api.auth.get<JobRiskStats>("/admin/jobs/risk-stats");
      if (!res.success) throw new Error(res.message || "Failed to load risk stats");
      return res.data!;
    },
    enabled,
  });
}

export function useJobRisk(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ["job-risk", "detail", jobId],
    queryFn: async () => {
      const res = await api.auth.get<JobRiskAssessment>(`/admin/jobs/${jobId}/risk`);
      if (!res.success)
        throw new Error(res.message || "Failed to load risk assessment");
      return res.data!;
    },
    enabled,
  });
}

export function useReviewJobRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      input,
    }: {
      jobId: string;
      input: ReviewJobRiskInput;
    }) => {
      const res = await api.auth.patch<JobRiskAssessment>(
        `/admin/jobs/${jobId}/risk`,
        input
      );
      if (!res.success) throw new Error(res.message || "Failed to review job risk");
      return res.data!;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job-risk", "flagged"] });
      queryClient.invalidateQueries({ queryKey: ["job-risk", "detail", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["job-risk", "stats"] });
    },
  });
}

export function useRecheckJobRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.auth.post<JobRiskAssessment>(
        `/admin/jobs/${jobId}/risk/recheck`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to recheck job risk");
      return res.data!;
    },
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["job-risk", "flagged"] });
      queryClient.invalidateQueries({ queryKey: ["job-risk", "detail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job-risk", "stats"] });
    },
  });
}