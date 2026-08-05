import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import type { AccountType } from "@/types/api/auth";

export interface ReferralSummaryData {
  referral_code: string;
  share_url: string;
  totals: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  time_series: { date: string; count: number }[];
  referred: {
    email: string;
    account_type: AccountType | null;
    status: string;
    created_at: string;
  }[];
}

export function useReferralSummary(enabled = true) {
  return useQuery({
    queryKey: ["referral", "summary"],
    enabled,
    queryFn: async () => {
      const res = await worker.auth.get<ReferralSummaryData>("/referral/summary");
      if (!res.success)
        throw new Error(res.message || "Failed to load referral summary");
      return res.data!;
    },
  });
}

export interface ReferralAdminRow {
  id: string;
  partner_id: string;
  partner_email: string | null;
  referred_user_id: string | null;
  referred_email: string;
  referred_account_type: AccountType | null;
  status: string;
  commission: string;
  notes: string | null;
  created_at: string;
}

export interface AllReferralsData {
  referrals: ReferralAdminRow[];
  stats: {
    total: number;
    byStatus: Record<string, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export type ReferralStatusValue =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

export function useUpdateReferralStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      status: ReferralStatusValue;
      note?: string;
    }) => {
      const res = await worker.auth.patch<{
        referral: { id: string; status: string };
      }>(`/referral/admin/${data.id}`, {
        status: data.status,
        ...(data.note ? { note: data.note } : {}),
      });
      if (!res.success)
        throw new Error(res.message || "Failed to update referral");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral", "list"] });
      queryClient.invalidateQueries({ queryKey: ["referral", "summary"] });
    },
  });
}

export function useAllReferrals(params?: {
  page?: number;
  limit?: number;
  status?: string;
  accountType?: string;
  partnerEmail?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;
  const accountType = params?.accountType;
  const partnerEmail = params?.partnerEmail;

  return useQuery({
    queryKey: ["referral", "list", { page, limit, status, accountType, partnerEmail }],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) query.set("status", status);
      if (accountType) query.set("accountType", accountType);
      if (partnerEmail) query.set("partnerEmail", partnerEmail);
      const res = await worker.auth.get<AllReferralsData>(
        `/referral/admin/all?${query}`
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load referrals");
      return res.data!;
    },
  });
}
