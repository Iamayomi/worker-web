"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useDisplayName } from "@/lib/hooks/use-display-name";
import { AccountType, UserRole } from "@/types/api/auth";
import { UserAnalyticsSection } from "@/components/admin/user-analytics";
import { JobAnalyticsSection } from "@/components/jobs/job-analytics";
import { AdminTotals } from "@/components/admin/admin-totals";
import { JobTotals } from "@/components/jobs/job-totals";
import { RecommendedJobs } from "@/components/jobs/recommended-jobs";
import { JobSearch } from "@/components/layout/job-search";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TalentHome({ name }: { name?: string }) {
  const firstName = name?.split(" ")[0];

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border/15 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 sm:p-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {firstName
            ? `Find your next role, ${firstName}`
            : "Find your next role"}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Browse verified roles from trusted clients and get matched with work
          that fits your skills and experience.
        </p>
        <div className="mt-6 max-w-lg">
          <JobSearch />
        </div>
        <div className="mt-6">
          <Button asChild>
            <Link href="/jobs">Browse all jobs</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Browse all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <RecommendedJobs />
      </section>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const name = useDisplayName();

  const roles = (user?.roles ?? []) as UserRole[];
  const isSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);
  const isAdmin =
    isSuperAdmin ||
    roles.includes(UserRole.ADMIN) ||
    user?.accountType === AccountType.ADMIN;
  const isClient = user?.accountType === AccountType.CLIENT;
  const isTalent = user?.accountType === AccountType.TALENT;

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-8">
        {isTalent ? (
          <TalentHome name={name} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {name ? `Welcome back, ${name}` : "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatToday()}
              </p>
            </div>

            {isAdmin && (
              <div className="space-y-4">
                <AdminTotals />
                <JobTotals />
              </div>
            )}
            {isClient && !isAdmin && <JobTotals />}

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Analytics</h2>
              {isAdmin && (
                <div className="space-y-8">
                  <UserAnalyticsSection showTotals={false} />
                  <JobAnalyticsSection showTotals={false} />
                </div>
              )}
              {isClient && !isAdmin && (
                <div className="space-y-8">
                  <JobAnalyticsSection showTotals={false} />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AnimatedContent>
  );
}
