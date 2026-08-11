"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useAdminPages, useDeletePage } from "@/lib/hooks/use-pages";
import { PostStatus } from "@/types/api/posts";
import type { Page } from "@/types/api/pages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { StatCard } from "@/components/shared/stat-card";
import { SectionSkeleton, StatCardsSkeleton } from "@/components/shared/skeletons";
import { Archive, CheckCircle2, ExternalLink, FileText, LayoutTemplate, PenLine, Pencil, Plus, Trash2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600",
  published: "bg-green-500/10 text-green-600",
  archived: "bg-gray-500/10 text-gray-600",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminPagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
    [user]
  );

  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdminPages();
  const deletePage = useDeletePage();

  const pages: Page[] = data?.pages ?? [];

  const totalPages = data?.pagination.total ?? 0;
  const publishedCount = pages.filter(
    (p) => p.status === PostStatus.PUBLISHED
  ).length;
  const draftCount = pages.filter((p) => p.status === PostStatus.DRAFT).length;
  const archivedCount = pages.filter(
    (p) => p.status === PostStatus.ARCHIVED
  ).length;

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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Landing pages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage content for public pages like talent, about and pricing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/pages/new">
                <Plus className="h-4 w-4" /> New page
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <StatCardsSkeleton count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total pages"
              value={totalPages}
              icon={LayoutTemplate}
            />
            <StatCard
              label="Published"
              value={publishedCount}
              icon={CheckCircle2}
            />
            <StatCard label="Drafts" value={draftCount} icon={PenLine} />
            <StatCard label="Archived" value={archivedCount} icon={Archive} />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load pages"}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <SectionSkeleton />
          ) : pages.length === 0 ? (
            <div className="rounded-lg border border-border/15">
              <EmptyState
                icon={FileText}
                title="No pages yet"
                description="Create a page to start managing its content."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/10 overflow-hidden rounded-lg border border-border/15">
              {pages.map((page) => (
                <li key={page.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/admin/pages/${page.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/admin/pages/${page.id}`);
                      }
                    }}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {page.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        /{page.slug} · Updated {formatDate(page.updatedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        className={STATUS_STYLES[page.status] ?? undefined}
                      >
                        {page.status}
                      </Badge>
                      <Link
                        href={`/admin/pages/${page.id}`}
                        aria-label={`Edit ${page.title}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {page.status === PostStatus.PUBLISHED && page.slug && (
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${page.title}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <button
                        type="button"
                        aria-label={`Delete ${page.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(page);
                        }}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <DeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePage.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              refetch();
            },
          });
        }}
        title="Delete page?"
        description={`This will permanently remove "${
          deleteTarget?.title ?? "this page"
        }" from the site. This action cannot be undone.`}
        isLoading={deletePage.isPending}
      />
    </AnimatedContent>
  );
}
