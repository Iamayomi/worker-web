"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { usePosts } from "@/lib/hooks/use-posts";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import type { Post } from "@/types/api/posts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";

function BlogCard({ post }: { post: Post }) {
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
        Blog
      </span>
      <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}
      <div className="mt-4 text-sm text-muted-foreground">
        <span>
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  usePageTitle("Blog");
  const { data, isLoading, isError, error } = usePosts({
    category: "Blog",
    limit: 24,
    sort: "newest",
  });

  const posts: Post[] = data?.posts ?? [];

  return (
    <AnimatedContent>
      <section className="border-b border-border bg-muted/40 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Stories, insights and news from the world of work.
          </p>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
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
                title="No blog posts yet"
                description="Check back soon for new stories and insights."
              />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/resources">
                Explore resources <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </AnimatedContent>
  );
}
