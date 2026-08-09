"use client";

import {
  CalendarDays,
  Info,
  LayoutTemplate,
  ListTree,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewLiveButton } from "@/components/admin/view-live-button";
import { PostStatus } from "@/types/api/posts";
import type { Page } from "@/types/api/pages";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function PageEditorSidebar({ page }: { page?: Page | null }) {
  const isEditing = !!page?.id;

  return (
    <aside className="space-y-4 self-start lg:sticky lg:top-6">
      <div className="space-y-4 rounded-lg border border-border/15 bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <LayoutTemplate className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Page overview</h2>
            <p className="text-xs text-muted-foreground">
              {isEditing ? "Landing page dashboard" : "Landing page dashboard"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Live URL
            </p>
            {isEditing ? (
              <div className="flex items-center justify-between gap-2">
                <code className="truncate rounded bg-muted px-1.5 py-1 text-xs">
                  /{page.slug}
                </code>
                <ViewLiveButton
                  href={`/${page.slug}`}
                  published={page.status === PostStatus.PUBLISHED}
                  label="View page"
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Save the page to get a preview URL.
              </p>
            )}
          </div>

          {isEditing && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ShieldCheck className="size-3.5" /> Status
                </span>
                <Badge
                  variant={
                    page.status === PostStatus.PUBLISHED
                      ? "secondary"
                      : "outline"
                  }
                >
                  {page.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ListTree className="size-3.5" /> Sections
                </span>
                <span className="font-medium">
                  {(page.sections ?? []).length}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-3.5" /> Updated
                </span>
                <span className="font-medium">{formatDate(page.updatedAt)}</span>
              </div>

              {page.status !== PostStatus.PUBLISHED && (
                <p className="flex items-start gap-1.5 rounded-md bg-yellow-500/10 px-2.5 py-2 text-xs text-yellow-600">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  This page is not published. Publish it to make it live at /
                  {page.slug}.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border/15 bg-card p-4 text-xs text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">Quick tips</p>
        <ul className="list-inside list-disc space-y-1">
          <li>The slug controls the public route, e.g. /talent.</li>
          <li>Sections render as blocks on the public page.</li>
          <li>Use “View live” to preview the published page.</li>
        </ul>
      </div>
    </aside>
  );
}
