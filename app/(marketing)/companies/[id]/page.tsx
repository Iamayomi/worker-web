"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, Building2, Globe, MapPin, Users } from "lucide-react";
import { usePublicClientProfile } from "@/lib/hooks/use-profiles";
import { useJobs } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { JobCard } from "@/components/jobs/job-card";
import { FollowButton } from "@/components/shared/follow-button";
import { FollowStats } from "@/components/follows/follow-stats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorAlert } from "@/components/shared/error-alert";
import { AnimatedContent } from "@/components/shared/animated-content";

export default function CompanyProfilePage() {
  const params = useParams<{ id: string }>();
  const { data: profile, isLoading, isError, error } = usePublicClientProfile(
    params.id
  );
  const jobs = useJobs({ clientProfileId: params.id, limit: 20 });

  usePageTitle(profile ? profile.companyName : "Company");

  if (isLoading) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <div className="space-y-3">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </AnimatedContent>
    );
  }

  if (isError || !profile) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <ErrorAlert
          message={
            error instanceof Error ? error.message : "This company is not available."
          }
        />
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/jobs">Browse jobs</Link>
          </Button>
        </div>
      </AnimatedContent>
    );
  }

  const initials = profile.companyName.slice(0, 2).toUpperCase() || "C";
  const location = [profile.country]
    .filter(Boolean)
    .join(", ");

  return (
    <AnimatedContent className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="size-16 rounded-xl">
                {profile.logoUrl && (
                  <AvatarImage
                    src={profile.logoUrl}
                    alt={profile.companyName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="rounded-xl text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight">
                    {profile.companyName}
                  </h1>
                  <BadgeCheck className="h-5 w-5 fill-foreground text-background" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {profile.industry && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {profile.industry}
                    </span>
                  )}
                  {profile.companySize && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {profile.companySize}
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {location}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <FollowStats userId={profile.userId} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <FollowButton targetUserId={profile.userId} />
            </div>
          </div>

          {profile.companyDescription && (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {profile.companyDescription}
            </p>
          )}

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Globe className="h-4 w-4" />
              {profile.website}
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Open jobs
            </h2>
            {jobs.data && jobs.data.pagination.total > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/jobs?clientProfileId=${profile.id}`}>View all</Link>
              </Button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {jobs.isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            )}
            {jobs.data && jobs.data.jobs.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No open jobs right now.
              </p>
            )}
            {jobs.data?.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
}
