"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useAdminPost } from "@/lib/hooks/use-posts";
import { PostForm } from "@/components/admin/post-form";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";
import { PageSkeleton } from "@/components/shared/skeletons";

export default function AdminContentEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
    [user]
  );

  const { data: post, isLoading, isError, error } = useAdminPost(params?.id);

  if (!isAdmin) {
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
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to content
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit post</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the post title, content and publishing settings.
          </p>
        </div>

        {isLoading ? (
          <PageSkeleton />
        ) : isError || !post ? (
          <ErrorAlert
            message={
              error instanceof Error ? error.message : "This post could not be found."
            }
          />
        ) : (
          <PostForm
            key={post.id}
            initial={post}
            onSaved={() => router.push("/admin/content")}
          />
        )}
      </div>
    </AnimatedContent>
  );
}
