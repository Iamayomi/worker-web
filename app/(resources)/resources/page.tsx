"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, FileText, TrendingUp } from "lucide-react";
import { usePosts } from "@/lib/hooks/use-posts";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { POST_CATEGORIES } from "@/lib/constants/options";
import type { Post } from "@/types/api/posts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";
import { cn } from "@/lib/utils";

const categoryLabel = (value: string) =>
  POST_CATEGORIES.find((c) => c === value) ?? value;

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/resources/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
    >
      {post.coverImage ? (
        <div className="mb-4 h-36 w-full overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : null}
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
        {post.category ?? "Article"}
      </span>
      <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : new Date(post.createdAt).toLocaleDateString()}
        </span>
        {post.tags.length > 0 && (
          <span className="text-xs">#{post.tags[0]}</span>
        )}
      </div>
    </Link>
  );
}

function ResourcesContent() {
  const searchParams = useSearchParams();
  usePageTitle("Resources");
  const initialCategory = searchParams.get("category") ?? "";
  const [category, setCategory] = useState(initialCategory);

  const { data, isLoading, isError, error } = usePosts({
    category: category || undefined,
    limit: 24,
    sort: "newest",
  });

  const allPosts: Post[] = data?.posts ?? [];
  const posts: Post[] =
    allPosts.length > 0
      ? allPosts.filter((post) => post.category !== "Blog")
      : allPosts;
  const filterOptions = ["", ...POST_CATEGORIES.filter((c) => c !== "Blog")];

  return (
    <AnimatedContent>
      <section className="border-b border-border bg-muted/40 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Resources
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Guides on hiring, landing roles, and building a global career.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option || "all"}
                type="button"
                onClick={() => setCategory(option)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === option
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {option || "All"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Link
            href="/talent-market-report"
            className="mb-8 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">
                  Worker Talent Market Report
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Global hiring trends and salary data for August 2026.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
              Read the report <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          {isError && (
            <div className="mb-6">
              <ErrorAlert
                message={
                  error instanceof Error ? error.message : "Failed to load posts."
                }
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-border/15">
              <EmptyState
                icon={FileText}
                title="No posts yet"
                description="Check back soon for new guides and articles."
              />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Browse jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </AnimatedContent>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={null}>
      <ResourcesContent />
    </Suspense>
  );
}
