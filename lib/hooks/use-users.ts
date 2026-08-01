import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type { AccountType, User, UserRole } from "@/types/api/auth";
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

export interface InviteesData {
  invitees: User[];
  pagination: Paginated;
}

export interface UsersListData {
  users: Array<{
    id: string;
    email: string;
    status: string;
    roles: string[];
    email_verified: boolean;
    verification_status?: string;
    created_at: string;
  }>;
  pagination: Paginated;
}

export type VerificationDecision = "verified" | "rejected";

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
    },
  });
}

export function useInvitees(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery({
    queryKey: queryKeys.user.inviteesList(page, limit),
    queryFn: async () => {
      const res = await worker.auth.get<InviteesData>(
        `/users/me/invitees?page=${page}&limit=${limit}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load invitees");
      return res.data!;
    },
  });
}

export function useAllUsers(params?: {
  page?: number;
  limit?: number;
  email?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const email = params?.email;

  return useQuery({
    queryKey: ["user", "list", { page, limit, email }],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (email) query.set("email", email);
      const res = await worker.auth.get<UsersListData>(`/users?${query}`);
      if (!res.success) throw new Error(res.message || "Failed to load users");
      return res.data!;
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
