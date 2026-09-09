import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import type { TalentProfileData } from "@/lib/hooks/use-profiles";

export type TalentSearchSort = "newest" | "experience" | "recently_active";

export interface TalentSearchParams {
  query?: string;
  skills?: string[];
  country?: string;
  employmentType?: string;
  workPreference?: string;
  minYearsExperience?: number;
  maxYearsExperience?: number;
  minSalary?: number;
  maxSalary?: number;
  availableBefore?: string;
  openToWorkOnly?: boolean;
  verifiedOnly?: boolean;
  sort?: TalentSearchSort;
  page?: number;
  limit?: number;
}

export interface TalentSearchResult {
  items: TalentProfileData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function toQueryString(params: TalentSearchParams): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    if (Array.isArray(value)) {
      for (const v of value) q.append(key, String(v));
    } else {
      q.set(key, String(value));
    }
  }
  return q.toString();
}

export function useTalentSearch(params: TalentSearchParams, enabled = true) {
  const qs = toQueryString(params);
  return useQuery({
    queryKey: ["talent-search", qs],
    enabled,
    queryFn: async () => {
      const res = await api.auth.get<TalentSearchResult>(
        `/talent-profiles/search?${qs}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to search talent");
      return res.data!;
    },
  });
}

export interface ReachOutInput {
  roleTitle: string;
  message: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  workPreference?: string;
}

export interface ReachOutResult {
  id: string;
  talentUserId: string;
  roleTitle: string;
  status: string;
  remainingThisMonth: number;
  createdAt: string;
}

export function useReachOut(profileId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReachOutInput) => {
      const res = await api.auth.post<ReachOutResult>(
        `/talent-profiles/${profileId}/outreach`,
        input
      );
      if (!res.success)
        throw new Error(res.message || "Failed to send outreach");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-search"] });
    },
  });
}

export interface SavedSearch {
  id: string;
  name: string;
  criteria: TalentSearchParams;
  lastRunAt: string | null;
  createdAt: string;
}

export function useSavedSearches() {
  return useQuery({
    queryKey: ["talent-saved-searches"],
    queryFn: async () => {
      const res = await api.auth.get<{ searches: SavedSearch[] }>(
        "/talent-profiles/searches"
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load saved searches");
      return res.data!;
    },
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; criteria: TalentSearchParams }) => {
      const res = await api.auth.post<SavedSearch>(
        "/talent-profiles/searches",
        input
      );
      if (!res.success)
        throw new Error(res.message || "Failed to save search");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-saved-searches"] });
    },
  });
}

export function useRunSavedSearch() {
  return useMutation({
    mutationFn: async ({ id, page = 1 }: { id: string; page?: number }) => {
      const res = await api.auth.post<TalentSearchResult & { search: SavedSearch }>(
        `/talent-profiles/searches/${id}/run?page=${page}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to run saved search");
      return res.data!;
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.auth.delete<{ deleted: boolean }>(
        `/talent-profiles/searches/${id}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to delete saved search");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-saved-searches"] });
    },
  });
}

export interface TalentSearchAnalytics {
  profiles_viewed_7d: number;
  profiles_viewed_30d: number;
  views_chart: { date: string; count: number }[];
  outreach_sent_this_month: number;
  outreach_monthly_limit: number;
  saved_searches: number;
}

export function useTalentSearchAnalytics(enabled = true) {
  return useQuery({
    queryKey: ["talent-search-analytics"],
    enabled,
    retry: false,
    queryFn: async () => {
      const res = await api.auth.get<TalentSearchAnalytics>(
        "/talent-profiles/search-analytics"
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load search analytics");
      return res.data!;
    },
  });
}
