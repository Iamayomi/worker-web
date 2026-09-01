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
} from "@/lib/types/billing";
import { PlanType, Currency } from "@/lib/types/billing";

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
  currency?: Currency;
}

export function useInitCheckout() {
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const res = await api.auth.post<InitCheckoutData>("/billing/checkout", {
        plan: input.plan,
        currency: input.currency,
      });
      if (!res.success || !res.data)
        throw new Error(res.message || "Failed to initialize checkout");
      return res.data;
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
