"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAdminPages,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
} from "@/lib/hooks/use-pages";
import { POST_STATUSES } from "@/lib/constants/options";
import { PostStatus } from "@/types/api/posts";
import type { Page } from "@/types/api/pages";
import type { PageSection } from "@/types/api/pages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { DeleteModal } from "@/components/ui/delete-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ContentSubNav } from "@/components/admin/content-sub-nav";
import { SectionSkeleton } from "@/components/shared/skeletons";
import { FileText, Plus, Trash2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600",
  published: "bg-green-500/10 text-green-600",
  archived: "bg-gray-500/10 text-gray-600",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface PageFormState {
  id?: string;
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  sections: PageSection[];
  status: PostStatus;
}

const EMPTY_FORM: PageFormState = {
  slug: "",
  title: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  sections: [],
  status: PostStatus.PUBLISHED,
};

function pageToForm(page: Page): PageFormState {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    heroTitle: page.heroTitle ?? "",
    heroSubtitle: page.heroSubtitle ?? "",
    heroImage: page.heroImage ?? "",
    sections: page.sections ?? [],
    status: page.status,
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function SectionEditor({
  sections,
  onChange,
}: {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
}) {
  function updateSection(index: number, patch: Partial<PageSection>) {
    const next = [...sections];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function addSection() {
    onChange([...sections, { heading: "", body: "", bullets: [] }]);
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-border/15 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section {index + 1}
            </span>
            <button
              type="button"
              aria-label={`Remove section ${index + 1}`}
              onClick={() => removeSection(index)}
              className="p-1 text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <FormInput
            label="Heading"
            value={section.heading ?? ""}
            onChange={(e) => updateSection(index, { heading: e.target.value })}
            placeholder="Why hire on Worker"
          />
          <FormTextarea
            label="Body"
            value={section.body ?? ""}
            onChange={(e) => updateSection(index, { body: e.target.value })}
            placeholder="A short paragraph describing this section."
            rows={3}
          />
          <FormInput
            label="Bullets (comma separated)"
            value={(section.bullets ?? []).join(", ")}
            onChange={(e) =>
              updateSection(index, {
                bullets: e.target.value
                  .split(",")
                  .map((b) => b.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Vetted talent, Fast matching, Global network"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addSection}
        className="w-full"
      >
        <Plus className="h-4 w-4" /> Add section
      </Button>
    </div>
  );
}

export default function AdminPagesPage() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
    [user]
  );

  const [form, setForm] = useState<PageFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdminPages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();

  const pages: Page[] = data?.pages ?? [];
  const isEditing = !!form.id;

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

  function setField<K extends keyof PageFormState>(
    key: K,
    value: PageFormState[K]
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      heroTitle: form.heroTitle.trim() || undefined,
      heroSubtitle: form.heroSubtitle.trim() || undefined,
      heroImage: form.heroImage.trim() || undefined,
      sections: form.sections.filter(
        (s) => s.heading?.trim() || s.body?.trim() || (s.bullets ?? []).length
      ),
      status: form.status,
    };

    if (form.id) {
      updatePage.mutate({ id: form.id, ...payload });
    } else {
      createPage.mutate(payload);
    }
  }

  function selectPage(page: Page) {
    setForm(pageToForm(page));
    setSlugTouched(true);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
  }

  const busy =
    createPage.isPending || updatePage.isPending || deletePage.isPending;

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Landing pages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage content for public pages like talent, community, about and
              pricing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button variant="outline" onClick={resetForm} disabled={busy}>
                New page
              </Button>
            )}
            <Button
              onClick={() => {
                resetForm();
                document
                  .getElementById("page-editor")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Plus className="h-4 w-4" /> New page
            </Button>
          </div>
        </div>

        <ContentSubNav />

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load pages"}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
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
                      onClick={() => selectPage(page)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectPage(page);
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40 ${
                        form.id === page.id ? "bg-primary/5" : ""
                      }`}
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
                        <button
                          type="button"
                          aria-label={`Delete ${page.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(page);
                          }}
                          className="p-1 text-muted-foreground transition-colors hover:text-destructive"
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

          <form
            id="page-editor"
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-border/15 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit page" : "New page"}
              </h2>
              {isEditing && (
                <Badge variant="secondary">/{form.slug}</Badge>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Title"
                required
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Find talent"
              />
              <FormInput
                label="Slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField("slug", slugify(e.target.value));
                }}
                placeholder="talent"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Hero title"
                value={form.heroTitle}
                onChange={(e) => setField("heroTitle", e.target.value)}
                placeholder="Hire the best, faster"
              />
              <FormInput
                label="Hero image URL"
                value={form.heroImage}
                onChange={(e) => setField("heroImage", e.target.value)}
                placeholder="https://cdn.example.com/hero.jpg"
              />
            </div>

            <FormTextarea
              label="Hero subtitle"
              value={form.heroSubtitle}
              onChange={(e) => setField("heroSubtitle", e.target.value)}
              placeholder="Browse vetted professionals and get matched in days."
              rows={3}
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                Sections
              </label>
              <SectionEditor
                sections={form.sections}
                onChange={(sections) => setField("sections", sections)}
              />
            </div>

            <FormSelect
              label="Status"
              value={form.status}
              onValueChange={(v) => setField("status", v as PostStatus)}
              options={POST_STATUSES}
            />

            {(createPage.isError || updatePage.isError) && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {createPage.error instanceof Error
                  ? createPage.error.message
                  : updatePage.error instanceof Error
                    ? updatePage.error.message
                    : "Something went wrong"}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={busy}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={busy}>
                {busy
                  ? "Saving..."
                  : isEditing
                    ? "Save changes"
                    : "Create page"}
              </Button>
            </div>
          </form>
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
              if (form.id === deleteTarget.id) resetForm();
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
