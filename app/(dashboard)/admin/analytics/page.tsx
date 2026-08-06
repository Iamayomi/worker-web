"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/types/api/auth";
import { AdminTotals } from "@/components/admin/admin-totals";
import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { UserAnalyticsSection } from "@/components/admin/user-analytics";
import { JobAnalyticsSection } from "@/components/jobs/job-analytics";
import { JobTotals } from "@/components/jobs/job-totals";
import { AnimatedContent } from "@/components/shared/animated-content";

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const canView = useMemo(() => {
    const roles = (user?.roles ?? []) as UserRole[];
    return (
      roles.includes(UserRole.SUPER_ADMIN) || roles.includes(UserRole.ADMIN)
    );
  }, [user]);

  if (!canView) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            You need an admin role to view this page.
          </div>
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Platform analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            An overview of user growth and job activity across the platform.
          </p>
        </div>

        <AdminSubNav />

        <AdminTotals />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">User growth</h2>
          <UserAnalyticsSection showTotals={false} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Job activity</h2>
          <JobTotals />
          <JobAnalyticsSection showTotals={false} />
        </section>
      </div>
    </AnimatedContent>
  );
}
