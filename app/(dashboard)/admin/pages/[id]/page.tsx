"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useAdminPage } from "@/lib/hooks/use-pages";
import { PageForm } from "@/components/admin/page-form";
import { PageEditorSidebar } from "@/components/admin/page-editor-sidebar";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";
import { PageSkeleton } from "@/components/shared/skeletons";

export default function AdminPagesEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
    [user]
  );

  const { data: page, isLoading, isError, error } = useAdminPage(params?.id);

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
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to landing pages
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit page</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the landing page sections and publishing settings.
          </p>
        </div>

        {isLoading ? (
          <PageSkeleton />
        ) : isError || !page ? (
          <ErrorAlert
            message={
              error instanceof Error ? error.message : "This page could not be found."
            }
          />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <PageForm
              key={page.id}
              initial={page}
              onSaved={() => router.push("/admin/pages")}
            />
            <PageEditorSidebar page={page} />
          </div>
        )}
      </div>
    </AnimatedContent>
  );
}
