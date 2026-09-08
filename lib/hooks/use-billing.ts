import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  SubscriptionResponse,
  InitCheckoutData,
  ListInvoicesResponse,
  BillingUsageData,
} from "@/lib/types/billing";
import { PlanType, Currency } from "@/lib/types/billing";

export enum BillingInterval {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface PlanPrice {
  amount: number;
  currency: string;
}

export interface PlanInfo {
  plan: PlanType;
  limits: SubscriptionResponse["limits"];
  monthly: PlanPrice;
  yearly: PlanPrice;
}

export function usePlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: async () => {
      const res = await api.get<{ plans: PlanInfo[] }>("/billing/plans");
      if (!res.success)
        throw new Error(res.message || "Failed to load plans");
      return res.data;
    },
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.billing.subscription(),
    queryFn: async () => {
      const res =
        await api.auth.get<SubscriptionResponse>("/billing");
      if (!res.success)
        throw new Error(res.message || "Failed to load subscription");
      return res.data;
    },
  });
}

export interface CheckoutInput {
  plan: PlanType;
  interval?: BillingInterval;
  currency?: Currency;
}

export function useInitCheckout() {
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const res = await api.auth.post<InitCheckoutData>("/billing/checkout", {
        plan: input.plan,
        interval: input.interval ?? BillingInterval.MONTHLY,
        currency: input.currency,
      });
      if (!res.success || !res.data)
        throw new Error(res.message || "Failed to initialize checkout");
      return res.data;
    },
  });
}

export function useVerifyCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txRef: string) => {
      const res = await api.auth.get<{
        verified: boolean;
        subscription: SubscriptionResponse["subscription"];
      }>(`/billing/verify?tx_ref=${encodeURIComponent(txRef)}`);
      if (!res.success)
        throw new Error(res.message || "Failed to verify checkout");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.billing.all });
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.auth.post<{ cancelled: boolean }>(
        "/billing/cancel",
      );
      if (!res.success)
        throw new Error(res.message || "Failed to cancel subscription");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.billing.all });
    },
  });
}

export function useResumeSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.auth.post<{ resumed: boolean }>("/billing/resume");
      if (!res.success)
        throw new Error(res.message || "Failed to resume subscription");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.billing.all });
    },
  });
}

export function useBillingUsage() {
  return useQuery({
    queryKey: ["billing", "usage"],
    queryFn: async () => {
      const res = await api.auth.get<BillingUsageData>("/billing/usage");
      if (!res.success)
        throw new Error(res.message || "Failed to load usage");
      return res.data;
    },
  });
}

export function useInvoices(page: number, limit: number) {
  return useQuery({
    queryKey: queryKeys.billing.invoices(page, limit),
    queryFn: async () => {
      const res = await api.auth.get<ListInvoicesResponse>(
        `/billing/invoices?page=${page}&limit=${limit}`,
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load invoices");
      return res.data;
    },
  });
}
