import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { queryKeys } from "@/lib/api/query-keys";

export type AnalyticsEventType = "profile_view" | "resume_download" | "job_view";
export type AnalyticsTargetType = "talent_profile" | "job";

export interface DailyEntry {
  date: string;
  count: number;
}

export interface StatusCountEntry {
  status: string;
  count: number;
}

export interface PlatformAverages {
  avg_profile_views: number;
  avg_resume_downloads: number;
  avg_applications: number;
  avg_interview_rate: number | null;
  avg_response_rate: number | null;
}

export interface TalentAnalyticsData {
  profile_views: number;
  profile_views_chart: DailyEntry[];
  resume_downloads: number;
  resume_downloads_chart: DailyEntry[];
  job_matches: number;
  total_applications: number;
  applications_by_status: StatusCountEntry[];
  applications_chart: DailyEntry[];
  interview_rate: number | null;
  response_rate: number | null;
  platform_averages: PlatformAverages;
}

export interface ClientAnalyticsData {
  total_jobs: number;
  job_views: number;
  job_views_chart: DailyEntry[];
  total_applications: number;
  applications_chart: DailyEntry[];
  application_rate: number | null;
  hiring_funnel: StatusCountEntry[];
  hires: number;
  time_to_hire_days: number | null;
  cost_per_hire: number | null;
  cost_data_available: boolean;
  quality_of_hire: number | null;
  ratings_count: number;
}

export interface AnalyticsPreferencesData {
  weekly_email_opt_in: boolean;
}

export interface RecordAnalyticsEventData {
  event_id: string;
  event_type: AnalyticsEventType;
  target_type: AnalyticsTargetType;
  target_id: string;
}

export function useTalentAnalytics(days?: number) {
  return useQuery({
    queryKey: queryKeys.analytics.talent(days),
    queryFn: async () => {
      const res = await worker.auth.get<TalentAnalyticsData>(
        `/analytics/talent${days ? `?days=${days}` : ""}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load analytics");
      return res.data!;
    },
  });
}

export function useClientAnalytics(days?: number) {
  return useQuery({
    queryKey: queryKeys.analytics.client(days),
    queryFn: async () => {
      const res = await worker.auth.get<ClientAnalyticsData>(
        `/analytics/client${days ? `?days=${days}` : ""}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load analytics");
      return res.data!;
    },
  });
}

export function useCreateHireRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      applicationId: string;
      rating: number;
      review?: string;
    }) => {
      const res = await worker.auth.post<{ rating: number }>(
        "/analytics/hire-ratings",
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to submit rating");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.client() });
    },
  });
}

export function useAnalyticsPreferences() {
  return useQuery({
    queryKey: queryKeys.analytics.preferences(),
    queryFn: async () => {
      const res = await worker.auth.get<AnalyticsPreferencesData>(
        "/analytics/preferences"
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load preferences");
      return res.data!;
    },
  });
}

export function useUpdateAnalyticsPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (weeklyEmailOptIn: boolean) => {
      const res = await worker.auth.patch<AnalyticsPreferencesData>(
        "/analytics/preferences",
        { weeklyEmailOptIn }
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update preferences");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.preferences(),
      });
    },
  });
}

export function useRecordAnalyticsEvent() {
  return useMutation({
    mutationFn: async (data: {
      eventType: AnalyticsEventType;
      targetType: AnalyticsTargetType;
      targetId: string;
    }) => {
      const res = await worker.post<RecordAnalyticsEventData>(
        "/analytics/events",
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to record event");
      return res.data!;
    },
  });
}
