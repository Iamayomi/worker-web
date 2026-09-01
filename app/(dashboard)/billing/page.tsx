"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  CreditCard,
  Loader2,
  Receipt,
  Sparkles,
  Briefcase,
  Rocket,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSubscription,
  useInitCheckout,
  useCancelSubscription,
  useInvoices,
} from "@/lib/hooks/use-billing";
import type { CheckoutInput } from "@/lib/hooks/use-billing";
import {
  PlanType,
  SubscriptionStatus,
  type PlanLimits,
  type SubscriptionData,
} from "@/lib/types/billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedContent } from "@/components/shared/animated-content";
import { SectionSkeleton } from "@/components/shared/skeletons";

interface PlanMeta {
  name: string;
  price: string;
  monthlyNgn: number;
  blurb: string;
  icon: LucideIcon;
  features: string[];
}

const PLANS: PlanMeta[] = [
  {
    name: "Free",
    price: "₦0",
    monthlyNgn: 0,
    blurb: "For getting started",
    icon: Rocket,
    features: ["1 active job", "Basic job posting"],
  },
  {
    name: "Pro",
    price: "₦10,000",
    monthlyNgn: 10000,
    blurb: "For growing teams",
    icon: Sparkles,
    features: [
      "Up to 10 active jobs",
      "1 recruiter seat",
      "Boost job listings",
      "Job alert distribution",
      "14-day free trial",
    ],
  },
  {
    name: "Enterprise",
    price: "₦50,000",
    monthlyNgn: 50000,
    blurb: "For large organisations",
    icon: Briefcase,
    features: [
      "Unlimited active jobs",
      "Up to 10 recruiter seats",
      "Boost job listings",
      "Job alert distribution",
    ],
  },
];

const INVOICE_PAGE_SIZE = 10;

function statusVariant(status: string) {
  const s = status.toLowerCase();
  if (s === "successful" || s === "completed" || s === "paid") return "default";
  if (s === "pending" || s === "processing") return "outline";
  return "destructive";
}

function formatAmount(amount: number | null, currency?: string | null) {
  if (amount == null) return "—";
  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : "";
  return `${symbol}${Number(amount).toLocaleString()}`;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CurrentPlanCard({
  effectivePlan,
  limits,
  subscription,
  onCancel,
  cancelPending,
}: {
  effectivePlan: PlanType;
  limits: PlanLimits | undefined;
  subscription: SubscriptionData | null;
  onCancel: () => void;
  cancelPending: boolean;
}) {
  const isFree = effectivePlan === PlanType.FREE;
  const maxJobs = limits?.maxActiveJobs ?? 0;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="capitalize">Current plan</CardTitle>
          <CardDescription>Your subscription and entitlements</CardDescription>
        </div>
        <Badge
          variant={isFree ? "outline" : "default"}
          className="capitalize"
        >
          {effectivePlan}
        </Badge>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Active jobs</dt>
            <dd className="mt-1 text-sm font-medium">
              {Number.isFinite(maxJobs) ? maxJobs : "Unlimited"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Recruiter seats</dt>
            <dd className="mt-1 text-sm font-medium">
              {limits?.maxRecruiterSeats ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1 text-sm font-medium capitalize">
              {subscription?.status ?? (isFree ? "inactive" : "none")}
            </dd>
          </div>
          {subscription?.trialEndsAt && (
            <div>
              <dt className="text-xs text-muted-foreground">Trial ends</dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDate(subscription.trialEndsAt)}
              </dd>
            </div>
          )}
          {subscription?.nextDueDate &&
            subscription.status === SubscriptionStatus.ACTIVE && (
              <div>
                <dt className="text-xs text-muted-foreground">Next due</dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(subscription.nextDueDate)}
                </dd>
              </div>
            )}
          <div>
            <dt className="text-xs text-muted-foreground">Boost listings</dt>
            <dd className="mt-1 text-sm font-medium">
              {limits?.allowsBoost ? "Enabled" : "Not included"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Job alerts</dt>
            <dd className="mt-1 text-sm font-medium">
              {limits?.allowsJobAlertDistribution
                ? "Enabled"
                : "Not included"}
            </dd>
          </div>
        </dl>

        {!isFree &&
          subscription?.status &&
          subscription.status !== SubscriptionStatus.CANCELED && (
            <div className="mt-6 border-t border-border/15 pt-4">
              <Button
                variant="destructive"
                onClick={onCancel}
                disabled={cancelPending}
              >
                {cancelPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                Cancel subscription
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

function PlanCard({
  plan,
  active,
  disabled,
  onSelect,
}: {
  plan: PlanMeta;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const Icon = plan.icon;
  return (
    <Card
      className={`flex flex-col ${
        active ? "border-primary ring-1 ring-primary/30" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">{plan.name}</CardTitle>
        </div>
        <CardDescription>{plan.blurb}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{plan.price}</span>
          <span className="text-xs text-muted-foreground">/ month</span>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 size-3.5 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          variant={active ? "outline" : "default"}
          disabled={active || disabled || plan.monthlyNgn === 0}
          onClick={onSelect}
        >
          {active ? "Current plan" : plan.monthlyNgn === 0 ? "Free" : "Choose plan"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const subQuery = useSubscription();
  const checkout = useInitCheckout();
  const cancel = useCancelSubscription();

  const [invoicePage, setInvoicePage] = useState(1);
  const invoicesQuery = useInvoices(invoicePage, INVOICE_PAGE_SIZE);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const data = subQuery.data;
  const effectivePlan = data?.effectivePlan ?? PlanType.FREE;
  const limits = data?.limits;
  const subscription = data?.subscription ?? null;

  // After a Flutterwave redirect back to /dashboard/billing?tx_ref=..., the
  // subscription should now reflect the new plan. Refetch and clear the param.
  const txRef = searchParams.get("tx_ref");
  useEffect(() => {
    if (txRef) {
      subQuery.refetch();
      router.replace("/dashboard/billing", { scroll: false });
    }
  }, [txRef, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (plan: PlanType) => {
    checkout.mutate(
      { plan } as CheckoutInput,
      {
        onSuccess: (result) => {
          if (result.checkoutUrl) {
            window.location.href = result.checkoutUrl;
          }
        },
        onError: (err) =>
          toast.error(err.message || "Failed to start checkout"),
      },
    );
  };

  const handleCancel = () => {
    cancel.mutate(undefined, {
      onSuccess: () => {
        setConfirmCancel(false);
        toast.success("Subscription cancelled");
      },
      onError: (err) =>
        toast.error(err.message || "Failed to cancel subscription"),
    });
  };

  if (subQuery.isLoading) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionSkeleton />
        </div>
      </AnimatedContent>
    );
  }

  const invoices = invoicesQuery.data?.invoices ?? [];
  const pagination = invoicesQuery.data?.pagination;

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Billing
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription, plan and payment history
          </p>
        </div>

        {subQuery.error && (
          <div className="border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {subQuery.error.message}
          </div>
        )}

        <CurrentPlanCard
          effectivePlan={effectivePlan}
          limits={limits}
          subscription={subscription}
          onCancel={() => setConfirmCancel(true)}
          cancelPending={cancel.isPending}
        />

        <div>
          <h2 className="mb-3 text-lg font-semibold">Plans</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                active={effectivePlan === (plan.name.toLowerCase() as PlanType)}
                disabled={checkout.isPending}
                onSelect={() =>
                  handleSelect(plan.name.toLowerCase() as PlanType)
                }
              />
            ))}
          </div>
          {checkout.isError && (
            <p className="mt-3 text-sm text-destructive">
              {(checkout.error as Error)?.message || "Failed to start checkout"}
            </p>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Invoices</h2>
          </div>
          <Card className="gap-0 p-0">
            <CardContent className="gap-0 p-0">
              {invoicesQuery.isLoading ? (
                <div className="p-6">
                  <SectionSkeleton />
                </div>
              ) : invoices.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No invoices yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-sm">
                          {formatDate(invoice.createdAt ?? invoice.paidAt)}
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {invoice.plan}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatAmount(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant(invoice.status)}
                            className="capitalize"
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={invoicePage <= 1}
                  onClick={() =>
                    setInvoicePage((p) => Math.max(1, p - 1))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={invoicePage >= (pagination.totalPages ?? 1)}
                  onClick={() => setInvoicePage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              You will lose access to {effectivePlan} benefits at the end of
              your current period. You can resubscribe at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>
              Keep plan
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              {cancel.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedContent>
  );
}
