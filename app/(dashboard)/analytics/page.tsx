"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";
import { useClientAnalytics } from "@/lib/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { SectionSkeleton } from "@/components/shared/skeletons";
import { ErrorAlert } from "@/components/shared/error-alert";

export default function AnalyticsPage() {
 const { user } = useAuth();
 const router = useRouter();

 const roles = (user?.roles ?? []) as UserRole[];
 const isAdmin =
 roles.includes(UserRole.SUPER_ADMIN) ||
 roles.includes(UserRole.ADMIN) ||
 user?.accountType === AccountType.ADMIN;

  const clientAnalytics = useClientAnalytics(30);

  useEffect(() => {
 if (isAdmin) {
 router.replace("/admin/analytics");
 return;
 }
  }, [router, user?.accountType, isAdmin]);

  if (isAdmin || user?.accountType !== AccountType.CLIENT) return null;
  if (clientAnalytics.isLoading) {
    return <AnimatedContent><SectionSkeleton /></AnimatedContent>;
  }
  if (clientAnalytics.error) {
    return <ErrorAlert message={clientAnalytics.error.message} />;
  }
  const data = clientAnalytics.data;
  if (!data) return null;

  return (
    <AnimatedContent className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Hiring analytics" description="Track your hiring funnel over the last 30 days." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Job views", data.job_views],
          ["Applications", data.total_applications],
          ["Hires", data.hires],
          ["Application rate", data.application_rate == null ? "—" : `${data.application_rate}%`],
        ].map(([label, value]) => (
          <Card key={String(label)}><CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Hiring funnel</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.hiring_funnel.length === 0 ? <p className="text-sm text-muted-foreground">No applications yet.</p> : data.hiring_funnel.map(item => (
            <div key={item.status} className="flex items-center justify-between border-b border-border/15 pb-2 text-sm last:border-0">
              <span className="capitalize">{item.status.replace(/_/g, " ")}</span><strong>{item.count}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Time to hire</p><p className="mt-1 text-xl font-semibold">{data.time_to_hire_days == null ? "—" : `${data.time_to_hire_days} days`}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Cost per hire</p><p className="mt-1 text-xl font-semibold">{data.cost_per_hire == null ? "—" : data.cost_per_hire.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Quality of hire</p><p className="mt-1 text-xl font-semibold">{data.quality_of_hire == null ? "—" : `${data.quality_of_hire}/5`}</p></CardContent></Card>
      </div>
    </AnimatedContent>
  );
}
