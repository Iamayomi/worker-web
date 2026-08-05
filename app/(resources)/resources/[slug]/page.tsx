"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { usePost } from "@/lib/hooks/use-posts";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { Badge } from "@/components/ui/badge";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-10 text-2xl font-bold tracking-tight">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-8 text-xl font-semibold tracking-tight">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-4 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-4 list-disc space-y-2 pl-6">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm leading-relaxed">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-border" />,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
};

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const { data: post, isLoading, isError, error } = usePost(slug);

  usePageTitle(post?.title);

  return (
    <AnimatedContent>
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All resources
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : isError || !post ? (
          <div className="mt-8">
            <ErrorAlert
              message={
                error instanceof Error
                  ? error.message
                  : "This post could not be found."
              }
            />
          </div>
        ) : (
          <>
            <header className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                {post.category && (
                  <Badge className="bg-primary/10 text-primary">
                    {post.category}
                  </Badge>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
            </header>

            {post.coverImage && (
              <div className="mt-8 overflow-hidden rounded-xl bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-8 text-base leading-relaxed">
              <ReactMarkdown components={markdownComponents}>
                {post.content}
              </ReactMarkdown>
            </div>

            {post.tags.length > 0 && (
              <footer className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </footer>
            )}
          </>
        )}
      </article>
    </AnimatedContent>
  );
}
