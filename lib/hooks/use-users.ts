import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type { AccountType, User, UserRole, UserStatus } from "@/types/api/auth";
import { queryKeys } from "@/lib/api/query-keys";

export interface InviteUserInput {
  email: string;
  account_type: AccountType;
  roles: UserRole[];
}

interface Paginated {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface InviteeStats {
  total: number;
  byStatus: Record<string, number>;
  byAccountType: Record<string, number>;
}

export interface InviteesData {
  invitees: User[];
  stats: InviteeStats;
  pagination: Paginated;
}

export interface UsersListData {
  users: Array<{
    id: string;
    email: string;
    status: string;
    roles: string[] | string | null | undefined;
    email_verified: boolean;
    verification_status?: string;
    created_at: string;
  }>;
  pagination: Paginated;
}

export type VerificationDecision = "verified" | "rejected";

function normalizeRoles(roles: string | string[] | null | undefined): string[] {
  if (Array.isArray(roles)) return roles;
  if (typeof roles === "string" && roles.trim())
    return roles
      .trim()
      .replace(/^\{|\}$/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

export interface RegistrationChartEntry {
  date: string;
  count: number;
}

export interface AdminDashboardData {
  total_users: number;
  active_users: number;
  new_users_today: number;
  total_talents: number;
  total_clients: number;
  referral_stats: {
    total_referrals: number;
    active_referrals: number;
  };
  registration_chart: RegistrationChartEntry[];
}

export function useAdminDashboard(
  params: { days?: number; accountType?: AccountType } = {},
) {
  const query = new URLSearchParams();
  if (params.days) query.set("days", String(params.days));
  if (params.accountType) query.set("accountType", params.accountType);
  const qs = query.toString();

  return useQuery({
    queryKey: queryKeys.user.adminDashboard(params),
    queryFn: async () => {
      const res = await worker.auth.get<AdminDashboardData>(
        `/users/admin/dashboard${qs ? `?${qs}` : ""}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load dashboard");
      return res.data!;
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteUserInput) => {
      const res = await worker.auth.post<{ user: User; otp_reference: string }>(
        "/auth/invite",
        data
      );
      if (!res.success) throw new Error(res.message || "Failed to send invite");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.invitees() });
      queryClient.invalidateQueries({ queryKey: ["user", "invites"] });
    },
  });
}

export function useInvitees(params?: {
  page?: number;
  limit?: number;
  accountType?: AccountType | "all";
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const accountType = params?.accountType ?? "all";

  return useQuery({
    queryKey: queryKeys.user.inviteesList(page, limit, accountType),
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (accountType !== "all") query.set("accountType", accountType);
      const res = await worker.auth.get<InviteesData>(
        `/users/me/invitees?${query}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load invitees");
      const data = res.data!;
      return {
        ...data,
        invitees: (data.invitees ?? []).map((u) => ({
          ...u,
          roles: normalizeRoles(u.roles as unknown as string | string[]) as UserRole[],
        })),
      };
    },
  });
}

export function useAllUsers(params?: {
  page?: number;
  limit?: number;
  email?: string;
  status?: string;
  accountType?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const email = params?.email;
  const status = params?.status;
  const accountType = params?.accountType;

  return useQuery({
    queryKey: ["user", "list", { page, limit, email, status, accountType }],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (email) query.set("email", email);
      if (status) query.set("status", status);
      if (accountType) query.set("accountType", accountType);
      const res = await worker.auth.get<UsersListData>(`/users?${query}`);
      if (!res.success) throw new Error(res.message || "Failed to load users");
      const data = res.data!;
      return {
        ...data,
        users: (data.users ?? []).map((u) => ({
          ...u,
          roles: normalizeRoles(u.roles),
        })),
      };
    },
  });
}

export function useAdminInvites(params?: {
  page?: number;
  limit?: number;
  accountType?: AccountType | "all";
  status?: UserStatus | "all";
  invitedByEmail?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const accountType = params?.accountType ?? "all";
  const status = params?.status ?? "all";
  const invitedByEmail = params?.invitedByEmail;

  return useQuery({
    queryKey: [
      "user",
      "invites",
      { page, limit, accountType, status, invitedByEmail },
    ],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (accountType !== "all") query.set("accountType", accountType);
      if (status !== "all") query.set("status", status);
      if (invitedByEmail) query.set("invitedByEmail", invitedByEmail);
      const res = await worker.auth.get<InviteesData>(`/users/invites?${query}`);
      if (!res.success) throw new Error(res.message || "Failed to load invites");
      const data = res.data!;
      return {
        ...data,
        invitees: (data.invitees ?? []).map((u) => ({
          ...u,
          roles: normalizeRoles(u.roles as unknown as string | string[]) as UserRole[],
        })),
      };
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<{ message: string }>(`/users/${id}`);
      if (!res.success) throw new Error(res.message || "Failed to delete user");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "list"] });
    },
  });
}

export function useReviewClientVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      decision: VerificationDecision;
    }) => {
      const res = await worker.auth.patch<{ message: string }>(
        "/client-profiles/verification",
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update verification");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "list"] });
    },
  });
}

export type UserDetailData = Omit<User, "totalInvited"> & {
  totalInvited?: number;
  referralCode?: string;
};

export function useGetUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", "detail", id],
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<{ user: UserDetailData }>(
        `/users/${id}`
      );
      if (!res.success) throw new Error(res.message || "Failed to load user");
      return res.data!.user;
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; reason?: string }) => {
      const res = await worker.auth.patch<{ message: string }>(
        `/users/${data.userId}/suspend`,
        { reason: data.reason }
      );
      if (!res.success) throw new Error(res.message || "Failed to suspend user");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "list"] });
      queryClient.invalidateQueries({ queryKey: ["user", "detail"] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await worker.auth.patch<{ message: string }>(
        `/users/${userId}/activate`,
        {}
      );
      if (!res.success)
        throw new Error(res.message || "Failed to activate user");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "list"] });
      queryClient.invalidateQueries({ queryKey: ["user", "detail"] });
    },
  });
}

export interface UpdateUserInput {
  userId: string;
  email?: string;
  accountType?: AccountType;
  roles?: UserRole[];
  status?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  tempPassword?: boolean;
  termsAccepted?: boolean;
  invitedBy?: string;
  invitedAt?: string;
  lastLoginAt?: string;
  referralCode?: string;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const { userId, ...body } = data;
      const res = await worker.auth.patch<{ user: User }>(
        `/users/${userId}`,
        body
      );
      if (!res.success) throw new Error(res.message || "Failed to update user");
      return res.data!.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "list"] });
      queryClient.invalidateQueries({ queryKey: ["user", "detail"] });
    },
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await worker.auth.upload<{ jobId: string; message: string }>(
        "/upload/avatar",
        formData
      );
      if (!res.success) throw new Error(res.message || "Upload failed");
      return res.data;
    },
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "documents");
      const res = await worker.auth.upload<{ jobId: string; message: string }>(
        "/upload/document",
        formData
      );
      if (!res.success) throw new Error(res.message || "Upload failed");
      return res.data;
    },
  });
}
