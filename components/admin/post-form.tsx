"use client";

import { useState } from "react";
import { useCreatePost, useUpdatePost } from "@/lib/hooks/use-posts";
import { POST_CATEGORIES, POST_STATUSES } from "@/lib/constants/options";
import { PostStatus, type Post } from "@/types/api/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ViewLiveButton } from "@/components/admin/view-live-button";

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

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

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

export function PostForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Post | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = !!initial?.id;

  const [form, setForm] = useState<PostFormState>(
    initial ? postToForm(initial) : EMPTY_FORM
  );
  const [slugTouched, setSlugTouched] = useState(false);

  const busy = createPost.isPending || updatePost.isPending;

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

    if (isEditing && initial?.id) {
      updatePost.mutate(
        { id: initial.id, ...payload },
        { onSuccess: () => onSaved?.() }
      );
    } else {
      createPost.mutate(payload, { onSuccess: () => onSaved?.() });
    }
  }

  return (
    <form
      id="content-editor"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-border/15 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Edit post" : "New post"}
        </h2>
        <div className="flex items-center gap-2">
          <ViewLiveButton
            href={`/resources/${form.slug.trim() || "preview"}`}
            published={
              form.status === PostStatus.PUBLISHED && !!form.slug.trim()
            }
            label="View live"
          />
          {isEditing && (
            <Badge variant="secondary">{initial?.id.slice(0, 8)}</Badge>
          )}
        </div>
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
        <div className="mb-2">
          <label className="text-sm font-medium">Content</label>
        </div>
        <RichTextEditor
          value={form.content}
          onChange={(html) => setField("content", html)}
          placeholder="Write your post content here..."
        />
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
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
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
  );
}
