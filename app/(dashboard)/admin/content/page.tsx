"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAdminPosts,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
} from "@/lib/hooks/use-posts";
import { POST_CATEGORIES, POST_STATUSES } from "@/lib/constants/options";
import { PostStatus, type Post } from "@/types/api/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { DeleteModal } from "@/components/ui/delete-modal";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ContentSubNav } from "@/components/admin/content-sub-nav";
import { TableSkeleton } from "@/components/shared/skeletons";
import { FileText, Plus, Trash2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600",
  published: "bg-green-500/10 text-green-600",
  archived: "bg-gray-500/10 text-gray-600",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

interface PostFormState {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  status: PostStatus;
}

const EMPTY_FORM: PostFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  tags: "",
  status: PostStatus.DRAFT,
};

const previewComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="my-4 text-3xl font-bold tracking-tight">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-6 text-2xl font-bold tracking-tight">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-4 text-xl font-semibold tracking-tight">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-3 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} className="text-primary underline underline-offset-2">
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
      {children}
    </pre>
  ),
};

function postToForm(post: Post): PostFormState {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    coverImage: post.coverImage ?? "",
    category: post.category ?? "",
    tags: post.tags.join(", "),
    status: post.status,
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminContentPage() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
    [user]
  );

  const [search, setSearch] = useState("");
  const [form, setForm] = useState<PostFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [contentTab, setContentTab] = useState<"write" | "preview">("write");

  const { data, isLoading, isError, error, refetch } = useAdminPosts({
    query: search || undefined,
    limit: 50,
  });
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const posts: Post[] = data?.posts ?? [];
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

  function setField<K extends keyof PostFormState>(
    key: K,
    value: PostFormState[K]
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
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content,
      coverImage: form.coverImage.trim() || undefined,
      category: form.category || undefined,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
    };

    if (form.id) {
      updatePost.mutate({ id: form.id, ...payload });
    } else {
      createPost.mutate(payload);
    }
  }

  function selectPost(post: Post) {
    setForm(postToForm(post));
    setSlugTouched(true);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
  }

  const busy =
    createPost.isPending || updatePost.isPending || deletePost.isPending;

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Content management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Write and manage blog posts, guides and career content.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button variant="outline" onClick={resetForm} disabled={busy}>
                New post
              </Button>
            )}
            <Button
              onClick={() => {
                resetForm();
                document
                  .getElementById("content-editor")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Plus className="h-4 w-4" /> New post
            </Button>
          </div>
        </div>

        <ContentSubNav />

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load posts"}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search posts..."
            />
            {isLoading ? (
              <TableSkeleton rows={6} columns={5} />
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-border/15">
                <EmptyState
                  icon={FileText}
                  title="No posts yet"
                  description="Create your first post to get started."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border/10 overflow-hidden rounded-lg border border-border/15">
                {posts.map((post) => (
                  <li key={post.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => selectPost(post)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectPost(post);
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40 ${
                        form.id === post.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {post.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {post.category ?? "Uncategorized"} · Updated{" "}
                          {formatDate(post.updatedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          className={
                            STATUS_STYLES[post.status] ?? undefined
                          }
                        >
                          {post.status}
                        </Badge>
                        <button
                          type="button"
                          aria-label={`Delete ${post.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(post);
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
            id="content-editor"
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-border/15 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit post" : "New post"}
              </h2>
              {isEditing && (
                <Badge variant="secondary">{form.id?.slice(0, 8)}</Badge>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Title"
                required
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="How to land your first remote job"
              />
              <FormInput
                label="Slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField("slug", slugify(e.target.value));
                }}
                placeholder="how-to-land-your-first-remote-job"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Category"
                value={form.category}
                onValueChange={(v) => setField("category", v)}
                options={POST_CATEGORIES.map((c) => ({
                  value: c,
                  label: c,
                }))}
                placeholder="Select category"
              />
              <FormSelect
                label="Status"
                value={form.status}
                onValueChange={(v) => setField("status", v as PostStatus)}
                options={POST_STATUSES}
              />
            </div>

            <FormInput
              label="Cover image URL"
              value={form.coverImage}
              onChange={(e) => setField("coverImage", e.target.value)}
              placeholder="https://cdn.example.com/cover.jpg"
            />

            <FormTextarea
              label="Excerpt"
              value={form.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
              placeholder="A short summary shown on cards."
              rows={2}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Content (markdown)
                </label>
                <div className="flex rounded-md border border-border p-0.5">
                  {(["write", "preview"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setContentTab(tab)}
                      className={`rounded px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        contentTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              {contentTab === "write" ? (
                <FormTextarea
                  label=""
                  required
                  value={form.content}
                  onChange={(e) => setField("content", e.target.value)}
                  placeholder="## Introduction&#10;&#10;Remote work is growing fast..."
                  rows={10}
                  className="font-mono"
                />
              ) : (
                <div className="min-h-[200px] rounded-md border border-border/15 bg-muted/30 p-4 text-sm leading-relaxed">
                  {form.content.trim() ? (
                    <ReactMarkdown components={previewComponents}>
                      {form.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-muted-foreground">
                      Nothing to preview yet.
                    </span>
                  )}
                </div>
              )}
            </div>

            <FormInput
              label="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setField("tags", e.target.value)}
              placeholder="remote, interview, resume"
            />

            {(createPost.isError || updatePost.isError) && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {createPost.error instanceof Error
                  ? createPost.error.message
                  : updatePost.error instanceof Error
                    ? updatePost.error.message
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
                    : "Create post"}
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
          deletePost.mutate(deleteTarget.id, {
            onSuccess: () => {
              if (form.id === deleteTarget.id) resetForm();
              setDeleteTarget(null);
              refetch();
            },
          });
        }}
        title="Delete post?"
        description={`This will permanently remove "${
          deleteTarget?.title ?? "this post"
        }" from the site. This action cannot be undone.`}
        isLoading={deletePost.isPending}
      />
    </AnimatedContent>
  );
}
