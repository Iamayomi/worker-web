"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useDisplayName } from "@/lib/hooks/use-display-name";
import { AccountType, UserRole } from "@/types/api/auth";
import { RecommendedJobs } from "@/components/jobs/recommended-jobs";
import { AnimatedContent } from "@/components/shared/animated-content";

export default function TalentHomePage() {
  const { user } = useAuth();
  const name = useDisplayName();

  const roles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    roles.includes(UserRole.SUPER_ADMIN) ||
    roles.includes(UserRole.ADMIN) ||
    user?.accountType === AccountType.ADMIN;
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;
  const firstName = name?.split(" ")[0];

  if (!isTalent) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            This page is available for talent accounts.
          </div>
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-2xl bg-neutral-950 p-6 shadow-xl shadow-neutral-950/20 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Welcome back
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {firstName ? `Good to see you, ${firstName}` : "Good to see you"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-300/90 sm:text-base">
            Fresh roles matched to your skills are waiting. Search, save, and
            apply before they close.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Recommended for you
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                Matched to your skills, experience, and preferences.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              View all jobs
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <RecommendedJobs pageSize={6} />
        </section>
      </div>
    </AnimatedContent>
  );
}
