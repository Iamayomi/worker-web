"use client";

import { useCallback, useState } from "react";
import { useReferralSummary } from "@/lib/hooks/use-referral";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { ErrorAlert } from "@/components/shared/error-alert";
import { StatCardsSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Copy, Gift, Link2, Share2, UserPlus, CheckCircle2, Clock, XCircle, Sparkles } from "lucide-react";

export function ReferralSummarySection() {
  const { data, isLoading, isError, error } = useReferralSummary();
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const copyCode = useCallback(async () => {
    if (!data?.referral_code) return;
    try {
      await navigator.clipboard.writeText(data.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [data]);

  const copyShare = useCallback(async () => {
    if (!data?.share_url) return;
    try {
      await navigator.clipboard.writeText(data.share_url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      setShareCopied(false);
    }
  }, [data]);

  if (isLoading) {
    return <StatCardsSkeleton count={5} />;
  }

  if (isError || !data) {
    return (
      <ErrorAlert
        message={
          error instanceof Error ? error.message : "Failed to load referrals"
        }
      />
    );
  }

  const totals = data.totals;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Your referral code:
          </p>
          <code className="rounded-md border border-border/15 bg-secondary/40 px-2 py-0.5 font-mono text-sm font-semibold">
            {data.referral_code}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="gap-1.5"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyShare}
            className="gap-1.5"
          >
            {shareCopied ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {shareCopied ? "Link copied" : "Share link"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Share your code and earn rewards when referrals join.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total referrals" value={totals.total} icon={UserPlus} />
        <StatCard label="Pending" value={totals.pending} icon={Clock} />
        <StatCard label="Active" value={totals.active} icon={Link2} />
        <StatCard label="Completed" value={totals.completed} icon={CheckCircle2} />
        <StatCard label="Cancelled" value={totals.cancelled} icon={XCircle} />
      </div>

      <SectionCard title="Referred users">
        {data.referred.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No referrals yet. Share your code to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/10">
            {data.referred.map((r) => (
              <li
                key={r.email}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">{r.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.account_type ??
                      "—"}{" "}
                    · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {r.status.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
