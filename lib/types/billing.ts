export enum PlanType {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export enum SubscriptionStatus {
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
}

export enum Currency {
  NGN = "NGN",
  USD = "USD",
}

export interface SubscriptionData {
  id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  amount: number | null;
  currency: string;
  nextDueDate: Date | null;
  trialEndsAt: Date | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlanLimits {
  maxActiveJobs: number;
  maxRecruiterSeats: number;
  allowsBoost: boolean;
  allowsJobAlertDistribution: boolean;
  allowsGoogleMeet: boolean;
  allowsGoogleCalendar: boolean;
  allowsGmailInbox: boolean;
  allowsTalentOutreach: boolean;
  maxMonthlyOutreach: number;
  pricePerMonthNgn: number;
}

export interface SubscriptionResponse {
  subscription: SubscriptionData | null;
  effectivePlan: PlanType;
  limits: PlanLimits;
}

export interface InitCheckoutData {
  checkoutUrl: string;
  txRef: string;
}

export interface SubscriptionInvoiceData {
  id: string;
  txRef: string | null;
  transactionId: string | null;
  plan: string;
  amount: number | null;
  currency: string;
  status: string;
  paidAt: Date | null;
  createdAt?: Date;
}

export interface ListInvoicesResponse {
  invoices: SubscriptionInvoiceData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuotaUsage {
  current: number;
  max: number;
  unlimited: boolean;
}

export interface BillingUsageData {
  effectivePlan: PlanType;
  jobPostings: QuotaUsage;
  recruiterSeats: QuotaUsage;
}
