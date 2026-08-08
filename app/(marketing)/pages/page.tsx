"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { usePublicPages } from "@/lib/hooks/use-pages";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import type { Page } from "@/types/api/pages";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";

export default function PagesListingPage() {
  usePageTitle("Pages");
  const { data, isLoading, isError, error } = usePublicPages({ limit: 100 });

  const pages: Page[] = data?.pages ?? [];

  return (
    <AnimatedContent>
      <section className="border-b border-border bg-muted/40 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pages
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Guides and information published by the Worker team.
          </p>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {isError && (
            <div className="mb-6">
              <ErrorAlert
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to load pages."
                }
              />
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl border border-border/15 bg-muted"
                />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="rounded-lg border border-border/15">
              <EmptyState
                icon={FileText}
                title="No pages yet"
                description="Check back soon for new content."
              />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                    {page.title}
                  </h3>
                  {page.heroSubtitle && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {page.heroSubtitle}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Updated{" "}
                      {new Date(page.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AnimatedContent>
  );
}
