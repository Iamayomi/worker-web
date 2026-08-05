"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePageBySlug } from "@/lib/hooks/use-pages";
import { DEFAULT_PAGE_CONTENT } from "@/lib/constants/pages";
import type { Page } from "@/types/api/pages";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";

export function ManagedPage({ slug }: { slug: string }) {
  const { data, isError } = usePageBySlug(slug);

  const page: Page = useMemo(() => {
    if (data && data.sections.length) return data;
    return DEFAULT_PAGE_CONTENT[slug];
  }, [data, slug]);

  if (!page) return null;

  const hero = page.heroTitle || page.title;
  const hasSections = page.sections.length > 0;

  return (
    <AnimatedContent>
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {page.title}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {hero}
          </h1>
          {page.heroSubtitle && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {page.heroSubtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/jobs">Browse jobs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {hasSections && (
        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {page.sections.map((section, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  {section.heading && (
                    <h2 className="text-lg font-semibold tracking-tight">
                      {section.heading}
                    </h2>
                  )}
                  {section.body && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  )}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((bullet, bIndex) => (
                        <li
                          key={bIndex}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {isError && (
              <p className="mt-6 text-xs text-muted-foreground">
                Showing default content. An admin can customize this page in the
                dashboard.
              </p>
            )}
          </div>
        </section>
      )}
    </AnimatedContent>
  );
}
