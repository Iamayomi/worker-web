"use client";

import { useState } from "react";
import { Check, Copy, Gift, Link2, Share2, Users } from "lucide-react";
import {
  useReferralSummary,
  type ReferralSummaryData,
} from "@/lib/hooks/use-referral";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";
import { SectionSkeleton } from "@/components/shared/skeletons";
import { ErrorAlert } from "@/components/shared/error-alert";
import { StatCard } from "@/components/shared/stat-card";
import { BarChart, type BarDatum } from "@/components/shared/bar-chart";
import { StatusBadge } from "@/components/shared/status-badge";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-600",
  cancelled: "bg-destructive/10 text-destructive",
};

function ShareLinkBox({ summary }: { summary: ReferralSummaryData }) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; leave the field selectable.
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">
          Share your referral link
        </h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Invite friends to Worker. When they sign up and get hired, you both get
        rewarded.
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-background p-2 pl-4">
        <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          readOnly
          value={summary.share_url}
          onFocus={(e) => e.target.select()}
          className="min-w-0 flex-1 bg-transparent text-sm text-muted-foreground focus:outline-none"
        />
        <Button size="sm" onClick={() => copy(summary.share_url)}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Referral code:{" "}
          <span className="font-mono font-semibold text-foreground">
            {summary.referral_code}
          </span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigator.share?.({
              title: "Join Worker",
              text: "Find and hire the best talent worldwide — or land your next role.",
              url: summary.share_url,
            })
          }
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
}

export default function ReferralPage() {
  usePageTitle("Referral");
  const { data, isLoading, error } = useReferralSummary();

  if (isLoading) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-4xl">
          <SectionSkeleton />
        </div>
      </AnimatedContent>
    );
  }

  if (error || !data) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-4xl">
          <ErrorAlert
            message={
              error instanceof Error ? error.message : "Failed to load referrals."
            }
          />
        </div>
      </AnimatedContent>
    );
  }

  const { totals, time_series, referred } = data;
  const chartData: BarDatum[] = time_series.map((point) => ({
    label: new Date(point.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    value: point.count,
  }));

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refer &amp; earn</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Grow the Worker community and get rewarded for every successful
            hire.
          </p>
        </div>

        <ShareLinkBox summary={data} />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total referrals" value={totals.total} icon={Users} />
          <StatCard label="Pending" value={totals.pending} icon={Gift} />
          <StatCard label="Active" value={totals.active} icon={Gift} />
          <StatCard label="Completed" value={totals.completed} icon={Check} />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Referrals over time
          </h2>
          {chartData.length > 0 ? (
            <div className="mt-5">
              <BarChart data={chartData} height={160} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No referrals yet — share your link to get started.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Referred by you</h2>
          {referred.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              You haven&rsquo;t referred anyone yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {referred.map((item) => (
                <li
                  key={item.email}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.email}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {item.account_type ?? "Not registered"} ·{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge
                    status={item.status}
                    styleMap={STATUS_STYLES}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AnimatedContent>
  );
}
