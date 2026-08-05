import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  Application,
  ApplicationAnalyticsData,
  ApplicationListData,
  ApplyJobData,
  ApplyJobInput,
  CreateJobData,
  CreateJobInput,
  Job,
  JobAnalyticsData,
  JobListData,
  JobQueryParams,
  JobStatus,
  ListSavedJobsData,
  MyJobsQueryParams,
  PaginationMeta,
  SavedJobIdsData,
  UpdateJobInput,
} from "@/types/api/jobs";

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

export function useJobs(params: JobQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: async () => {
      const res = await worker.get<JobListData>(buildUrl("/jobs", params));
      if (!res.success) throw new Error(res.message || "Failed to load jobs");
      return res.data!;
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: async () => {
      const res = await worker.auth.get<Job>(`/jobs/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to load job");
      return res.data!;
    },
  });
}

export function useJobBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(`slug:${slug}`),
    queryFn: async () => {
      const res = await worker.auth.get<Job>(`/jobs/by-slug/${slug}`);
      if (!res.success) throw new Error(res.message || "Failed to load job");
      return res.data!;
    },
  });
}

export interface AdminJobDetail extends Job {
  clientEmail: string | null;
  applicationsCount: number;
}

export function useAdminJob(id: string) {
  return useQuery({
    queryKey: ["jobs", "admin-detail", id],
    queryFn: async () => {
      const res = await worker.auth.get<AdminJobDetail>(`/jobs/admin/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to load job");
      return res.data!;
    },
  });
}

export function useMyJobs(params: MyJobsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.jobs.mine(params),
    queryFn: async () => {
      const res = await worker.auth.get<JobListData>(
        buildUrl("/jobs/mine", params)
      );
      if (!res.success) throw new Error(res.message || "Failed to load jobs");
      return res.data!;
    },
  });
}

export function useJobAnalytics(
  params: { days?: number; status?: JobStatus; scope?: "mine" } = {},
) {
  const query = new URLSearchParams();
  if (params.days) query.set("days", String(params.days));
  if (params.status) query.set("status", params.status);
  if (params.scope) query.set("scope", params.scope);
  const qs = query.toString();

  return useQuery({
    queryKey: queryKeys.jobs.analytics(params),
    queryFn: async () => {
      const res = await worker.auth.get<JobAnalyticsData>(
        `/jobs/analytics${qs ? `?${qs}` : ""}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load job analytics");
      return res.data!;
    },
  });
}

export function useRecommendedJobs(limit = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.jobs.recommendations(limit),
    queryFn: async ({ pageParam }) => {
      const res = await worker.auth.get<JobListData>(
        `/jobs/recommendations?limit=${limit}&page=${pageParam}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load recommendations");
      return res.data!;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobInput) => {
      const res = data.signup
        ? await worker.post<CreateJobData>("/jobs", data)
        : await worker.auth.post<CreateJobData>("/jobs", data);
      if (!res.success) throw new Error(res.message || "Failed to create job");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useUpdateJob(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateJobInput) => {
      const res = await worker.auth.patch<Job>(`/jobs/${id}`, data);
      if (!res.success) throw new Error(res.message || "Failed to update job");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<{ message: string }>(`/jobs/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to delete job");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export interface AdminJobRow {
  id: string;
  clientProfileId: string;
  companyName: string | null;
  clientEmail: string | null;
  title: string;
  category: string | null;
  employmentType: string;
  workPreference: string;
  location: string;
  country: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  status: JobStatus;
  expiresAt: string;
  createdAt: string;
  applicationsCount: number;
}

export interface AllJobsData {
  jobs: AdminJobRow[];
  pagination: PaginationMeta;
}

export function useAllJobs(params: {
  page?: number;
  limit?: number;
  query?: string;
  status?: JobStatus | "all";
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery({
    queryKey: ["jobs", "admin-list", { page, limit, query: params.query, status: params.status }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (params.query) query.set("query", params.query);
      if (params.status && params.status !== "all") query.set("status", params.status);
      const res = await worker.auth.get<AllJobsData>(`/jobs/admin/all?${query}`);
      if (!res.success) throw new Error(res.message || "Failed to load jobs");
      return res.data!;
    },
  });
}

export function useDeleteJobAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<{ message: string }>(`/jobs/admin/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to delete job");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useApplyJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: ApplyJobInput }) => {
      const res = data.signup
        ? await worker.post<ApplyJobData>(`/jobs/${jobId}/apply`, data)
        : await worker.auth.post<ApplyJobData>(`/jobs/${jobId}/apply`, data);
      if (!res.success) throw new Error(res.message || "Failed to apply");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

export function useSavedJobIds(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.savedJobs.ids(),
    queryFn: async () => {
      const res = await worker.auth.get<SavedJobIdsData>("/saved-jobs/ids");
      if (!res.success)
        throw new Error(res.message || "Failed to load saved job ids");
      return res.data!;
    },
    enabled,
  });
}

export function useSavedJobs(
  params: { page?: number; limit?: number } = {},
  enabled = true
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery({
    queryKey: queryKeys.savedJobs.list({ page, limit }),
    queryFn: async () => {
      const res = await worker.auth.get<ListSavedJobsData>(
        `/saved-jobs?page=${page}&limit=${limit}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load saved jobs");
      return res.data!;
    },
    enabled,
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await worker.auth.post<{ saved: boolean }>(
        `/saved-jobs/${jobId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to save job");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs.all });
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await worker.auth.delete<{ saved: boolean }>(
        `/saved-jobs/${jobId}`
      );
      if (!res.success) throw new Error(res.message || "Failed to unsave job");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs.all });
    },
  });
}

export function useUploadCv() {
  return useMutation({    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await worker.post<{ url: string; publicId: string }>(
        "/upload/cv",
        formData
      );
      if (!res.success) throw new Error(res.message || "Failed to upload CV");
      return res.data!;
    },
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: async () => {
      const res = await worker.auth.get<Application>(`/applications/${id}`);
      if (!res.success)
        throw new Error(res.message || "Failed to load application");
      return res.data!;
    },
  });
}

export function useAdminApplication(id: string) {
  return useQuery({
    queryKey: ["applications", "admin-detail", id],
    queryFn: async () => {
      const res = await worker.auth.get<Application>(
        `/applications/admin/${id}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load application");
      return res.data!;
    },
  });
}

export function useApplicationAnalytics(params: { days?: number } = {}) {
  const query = new URLSearchParams();
  if (params.days) query.set("days", String(params.days));
  const qs = query.toString();

  return useQuery({
    queryKey: queryKeys.applications.analytics(params),
    queryFn: async () => {
      const res = await worker.auth.get<ApplicationAnalyticsData>(
        `/applications/analytics${qs ? `?${qs}` : ""}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load application analytics");
      return res.data!;
    },
  });
}

export interface AdminApplicationRow {
  id: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string | null;
  companyName: string | null;
  clientEmail: string | null;
  talentProfileId: string;
  applicantEmail: string | null;
  applicantAccountType: string | null;
  status: string;
  proposedRate: string | null;
  currency: string | null;
  createdAt: string;
}

export interface AllApplicationsData {
  applications: AdminApplicationRow[];
  stats: {
    total: number;
    byStatus: Record<string, number>;
    byAccountType: Record<string, number>;
  };
  pagination: PaginationMeta;
}

export function useAllApplications(params: {
  page?: number;
  limit?: number;
  status?: string | "all";
  accountType?: string | "all";
  query?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery({
    queryKey: [
      "applications",
      "admin-list",
      { page, limit, status: params.status, accountType: params.accountType, query: params.query },
    ],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (params.status && params.status !== "all") query.set("status", params.status);
      if (params.accountType && params.accountType !== "all")
        query.set("accountType", params.accountType);
      if (params.query) query.set("query", params.query);
      const res = await worker.auth.get<AllApplicationsData>(
        `/applications/admin/all?${query}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load applications");
      return res.data!;
    },
  });
}

export function useJobApplications(
  jobId: string,
  params: Record<string, unknown> = {}
) {
  return useQuery({
    queryKey: queryKeys.applications.byJob(jobId, params),
    queryFn: async () => {
      const res = await worker.auth.get<ApplicationListData>(
        buildUrl(`/jobs/${jobId}/applications`, params)
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load applications");
      return res.data!;
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        toStatus: string;
        note?: string;
        rejectionReason?: string;
      };
    }) => {
      const res = await worker.auth.patch<Application>(
        `/applications/${id}/status`,
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update status");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

export function useUpdateApplicationStatusAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        toStatus: string;
        note?: string;
        rejectionReason?: string;
      };
    }) => {
      const res = await worker.auth.patch<Application>(
        `/applications/admin/${id}/status`,
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update status");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.post<Application>(
        `/applications/${id}/accept`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to accept offer");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

export function useDeleteApplicationAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<null>(
        `/applications/admin/${id}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to delete application");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}
