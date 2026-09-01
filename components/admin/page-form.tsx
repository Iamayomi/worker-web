"use client";

import { useState } from "react";
import { useCreatePage, useUpdatePage } from "@/lib/hooks/use-pages";
import { POST_STATUSES } from "@/lib/constants/options";
import { PostStatus } from "@/types/api/posts";
import type { Page, PageSection } from "@/types/api/pages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { ViewLiveButton } from "@/components/admin/view-live-button";
import { Plus, Trash2 } from "lucide-react";

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

function slugify(title: string): string {
 return title
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9]+/g, "-")
 .replace(/^-+|-+$/g, "");
}

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
 className="space-y-3 border border-border/15 p-4"
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

export function PageForm({
 initial,
 onSaved,
 onCancel,
}: {
 initial?: Page | null;
 onSaved?: () => void;
 onCancel?: () => void;
}) {
 const createPage = useCreatePage();
 const updatePage = useUpdatePage();
 const isEditing = !!initial?.id;

 const [form, setForm] = useState<PageFormState>(
 initial ? pageToForm(initial) : EMPTY_FORM
 );
 const [slugTouched, setSlugTouched] = useState(false);

 const busy = createPage.isPending || updatePage.isPending;

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

 if (isEditing && initial?.id) {
 updatePage.mutate(
 { id: initial.id, ...payload },
 { onSuccess: () => onSaved?.() }
 );
 } else {
 createPage.mutate(payload, { onSuccess: () => onSaved?.() });
 }
 }

 return (
 <form
 id="page-editor"
 onSubmit={handleSubmit}
 className="space-y-4 border border-border/15 p-5"
 >
 <div className="flex flex-wrap items-center justify-between gap-2">
 <h2 className="text-lg font-semibold">
 {isEditing ? "Edit page" : "New page"}
 </h2>
 <div className="flex items-center gap-2">
 <ViewLiveButton
 href={`/${form.slug.trim() || "preview"}`}
 published={
 form.status === PostStatus.PUBLISHED && !!form.slug.trim()
 }
 label="View live page"
 />
 {isEditing && <Badge variant="secondary">/{form.slug}</Badge>}
 </div>
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
 <label className="mb-2 block text-sm font-medium">Sections</label>
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
 <div className=" border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 {createPage.error instanceof Error
 ? createPage.error.message
 : updatePage.error instanceof Error
 ? updatePage.error.message
 : "Something went wrong"}
 </div>
 )}

 <div className="flex items-center justify-end gap-2 pt-2">
 {isEditing && onCancel && (
 <Button
 type="button"
 variant="outline"
 onClick={onCancel}
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
 );
}
