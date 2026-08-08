"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddCertification,
  useAddEducation,
  useAddWorkExperience,
  useAdminCertifications,
  useAdminEducations,
  useAdminWorkExperiences,
  useMyCertifications,
  useMyEducations,
  useMyWorkExperiences,
  usePublicCertifications,
  usePublicEducations,
  usePublicWorkExperiences,
  useRemoveCertification,
  useRemoveEducation,
  useRemoveWorkExperience,
  useUpdateCertification,
  useUpdateEducation,
  useUpdateWorkExperience,
} from "@/lib/hooks/use-talent-entries";
import type {
  CertificationData,
  EducationData,
  WorkExperienceData,
} from "@/types/api/talent";

interface EntryField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "date" | "url" | "checkbox";
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
}

interface EntryConfig<TEntry> {
  title: string;
  singular: string;
  emptyText: string;
  fields: EntryField[];
  titleOf: (item: TEntry) => string;
  subtitleOf: (item: TEntry) => string;
  dateLine: (item: TEntry) => string | null;
  detailLine: (item: TEntry) => string | null;
  linksOf: (item: TEntry) => { label: string; url: string }[];
}

interface EntryListProps<TEntry, TInput> {
  config: EntryConfig<TEntry>;
  items: TEntry[] | undefined;
  isLoading: boolean;
  isError: boolean;
  editable?: boolean;
  add: UseMutationResult<unknown, Error, TInput, unknown>;
  update: UseMutationResult<unknown, Error, TInput & { id: string }, unknown>;
  remove: UseMutationResult<unknown, Error, string, unknown>;
  className?: string;
}

function formatMonthYear(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function EntryListEditor<TEntry extends { id: string }, TInput>({
  config,
  items,
  isLoading,
  isError,
  editable,
  add,
  update,
  remove,
  className,
}: EntryListProps<TEntry, TInput>) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TEntry | null>(null);
  const [deleting, setDeleting] = useState<TEntry | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const openAdd = () => {
    setEditing(null);
    setForm({});
    setFlags({});
    setFormOpen(true);
  };

  const openEdit = (item: TEntry) => {
    setEditing(item);
    const nextForm: Record<string, string> = {};
    const nextFlags: Record<string, boolean> = {};
    const record = item as unknown as Record<string, unknown>;
    for (const field of config.fields) {
      const value = record[field.key];
      if (field.type === "checkbox") {
        nextFlags[field.key] = Boolean(value);
      } else if (field.type === "date") {
        nextForm[field.key] =
          typeof value === "string" ? value.slice(0, 10) : "";
      } else if (typeof value === "string" || typeof value === "number") {
        nextForm[field.key] = String(value ?? "");
      }
    }
    setForm(nextForm);
    setFlags(nextFlags);
    setFormOpen(true);
  };

  const setValue = (key: string) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const payload: Record<string, unknown> = {};
    let missing: string | null = null;

    for (const field of config.fields) {
      if (field.type === "checkbox") {
        payload[field.key] = flags[field.key] ?? false;
        continue;
      }
      const value = form[field.key]?.trim() ?? "";
      if (field.required && !value) {
        missing = field.label;
        break;
      }
      if (value) payload[field.key] = value;
    }

    if (missing) {
      toast.error(`${missing} is required`);
      return;
    }

    if (editing) {
      payload.id = editing.id;
    }

    const mutation = editing ? update : add;
    mutation.mutate(payload as TInput & { id: string }, {
      onSuccess: () => {
        toast.success(
          editing ? `${config.singular} updated` : `${config.singular} added`
        );
        setFormOpen(false);
      },
      onError: (err: unknown) =>
        toast.error(
          err instanceof Error
            ? err.message
            : `Failed to save ${config.singular.toLowerCase()}`
        ),
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`${config.singular} removed`);
        setDeleting(null);
      },
      onError: (err: unknown) =>
        toast.error(
          err instanceof Error
            ? err.message
            : `Failed to remove ${config.singular.toLowerCase()}`
        ),
    });
  };

  const saving = add.isPending || update.isPending;

  return (
    <SectionCard
      title={config.title}
      className={className}
      actions={
        editable ? (
          <Button size="sm" variant="outline" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      ) : isError || !items || items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{config.emptyText}</p>
      ) : (
        <ul className="divide-y divide-border/15">
          {items.map((item) => {
            const links = config.linksOf(item);
            const dateLine = config.dateLine(item);
            const detailLine = config.detailLine(item);
            const subtitle = config.subtitleOf(item);
            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold">
                    {config.titleOf(item)}
                  </p>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                  )}
                  {dateLine && (
                    <p className="text-xs text-muted-foreground">{dateLine}</p>
                  )}
                  {detailLine && (
                    <p className="text-sm text-muted-foreground">
                      {detailLine}
                    </p>
                  )}
                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {editable && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${config.singular.toLowerCase()}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(item)}
                      aria-label={`Delete ${config.singular.toLowerCase()}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
            </DialogTitle>
            <DialogDescription>
              {config.title} shown on your public profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) =>
              field.type === "checkbox" ? (
                <div
                  key={field.key}
                  className="flex items-center gap-2 sm:col-span-2"
                >
                  <Switch
                    checked={flags[field.key] ?? false}
                    onCheckedChange={(checked) =>
                      setFlags((s) => ({ ...s, [field.key]: checked }))
                    }
                  />
                  <Label>{field.label}</Label>
                </div>
              ) : (
                <div
                  key={field.key}
                  className={
                    field.fullWidth
                      ? "space-y-1.5 sm:col-span-2"
                      : "space-y-1.5"
                  }
                >
                  <Label>
                    {field.label}
                    {field.required && <span className="text-foreground"> *</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={form[field.key] ?? ""}
                      onChange={(e) => setValue(field.key)(e.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      type={
                        field.type === "date"
                          ? "date"
                          : field.type === "url"
                            ? "url"
                            : "text"
                      }
                      value={form[field.key] ?? ""}
                      onChange={(e) => setValue(field.key)(e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              )
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={confirmDelete}
        isLoading={remove.isPending}
        title={`Delete ${config.singular.toLowerCase()}?`}
        description={`This will remove it from your profile. This action cannot be undone.`}
      />
    </SectionCard>
  );
}

const WORK_EXPERIENCE_CONFIG: EntryConfig<WorkExperienceData> = {
  title: "Work experience",
  singular: "Work experience",
  emptyText: "No work experience added yet.",
  fields: [
    { key: "role", label: "Role", required: true },
    { key: "companyName", label: "Company", required: true },
    { key: "startDate", label: "Start date", type: "date", required: true },
    { key: "endDate", label: "End date", type: "date" },
    {
      key: "isCurrent",
      label: "I currently work here",
      type: "checkbox",
      fullWidth: true,
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      fullWidth: true,
      placeholder: "What did you do in this role?",
    },
  ],
  titleOf: (item) => (item as WorkExperienceData).role,
  subtitleOf: (item) => (item as WorkExperienceData).companyName,
  dateLine: (item) => {
    const entry = item as WorkExperienceData;
    if (!entry.startDate) return null;
    if (entry.isCurrent || !entry.endDate)
      return `${formatMonthYear(entry.startDate)} – Present`;
    return `${formatMonthYear(entry.startDate)} – ${formatMonthYear(
      entry.endDate
    )}`;
  },
  detailLine: (item) => (item as WorkExperienceData).description ?? null,
  linksOf: () => [],
};

const EDUCATION_CONFIG: EntryConfig<EducationData> = {
  title: "Education",
  singular: "Education",
  emptyText: "No education added yet.",
  fields: [
    { key: "institution", label: "Institution", required: true },
    { key: "degree", label: "Degree", required: true },
    { key: "fieldOfStudy", label: "Field of study" },
    { key: "startDate", label: "Start date", type: "date", required: true },
    { key: "endDate", label: "End date", type: "date" },
    {
      key: "isCurrent",
      label: "I currently study here",
      type: "checkbox",
      fullWidth: true,
    },
    { key: "grade", label: "Grade" },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      fullWidth: true,
    },
  ],
  titleOf: (item) => {
    const entry = item as EducationData;
    return [entry.degree, entry.fieldOfStudy].filter(Boolean).join(" · ");
  },
  subtitleOf: (item) => (item as EducationData).institution,
  dateLine: (item) => {
    const entry = item as EducationData;
    if (!entry.startDate) return null;
    if (entry.isCurrent || !entry.endDate)
      return `${formatMonthYear(entry.startDate)} – Present`;
    return `${formatMonthYear(entry.startDate)} – ${formatMonthYear(
      entry.endDate
    )}`;
  },
  detailLine: (item) => {
    const entry = item as EducationData;
    return [entry.grade, entry.description].filter(Boolean).join(" · ") || null;
  },
  linksOf: () => [],
};

const CERTIFICATION_CONFIG: EntryConfig<CertificationData> = {
  title: "Certifications",
  singular: "Certification",
  emptyText: "No certifications added yet.",
  fields: [
    { key: "name", label: "Certification name", required: true },
    { key: "issuer", label: "Issuer", required: true },
    { key: "issueDate", label: "Issue date", type: "date", required: true },
    { key: "expiryDate", label: "Expiry date", type: "date" },
    { key: "credentialId", label: "Credential ID" },
    {
      key: "credentialUrl",
      label: "Credential URL",
      type: "url",
      fullWidth: true,
      placeholder: "https://",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      fullWidth: true,
    },
  ],
  titleOf: (item) => (item as CertificationData).name,
  subtitleOf: (item) => (item as CertificationData).issuer,
  dateLine: (item) => {
    const entry = item as CertificationData;
    if (!entry.issueDate) return null;
    const issued = `Issued ${formatMonthYear(entry.issueDate)}`;
    return entry.expiryDate
      ? `${issued} · Expires ${formatMonthYear(entry.expiryDate)}`
      : issued;
  },
  detailLine: (item) => (item as CertificationData).description ?? null,
  linksOf: (item) => {
    const entry = item as CertificationData;
    return entry.credentialUrl
      ? [{ label: "View credential", url: entry.credentialUrl }]
      : [];
  },
};

interface TalentEntryListProps {
  editable?: boolean;
  admin?: boolean;
  talentProfileId?: string;
  className?: string;
}

export function WorkExperienceList({
  editable,
  admin,
  talentProfileId,
  className,
}: TalentEntryListProps) {
  const mine = useMyWorkExperiences();
  const pub = usePublicWorkExperiences(talentProfileId ?? "");
  const mineMutations = {
    add: useAddWorkExperience(),
    update: useUpdateWorkExperience(),
    remove: useRemoveWorkExperience(),
  };
  const adminMutations = useAdminWorkExperiences(talentProfileId ?? "");

  return (
    <EntryListEditor
      config={WORK_EXPERIENCE_CONFIG}
      items={talentProfileId ? pub.data : mine.data}
      isLoading={talentProfileId ? pub.isLoading : mine.isLoading}
      isError={talentProfileId ? pub.isError : mine.isError}
      editable={editable}
      add={admin ? adminMutations.add : mineMutations.add}
      update={admin ? adminMutations.update : mineMutations.update}
      remove={admin ? adminMutations.remove : mineMutations.remove}
      className={className}
    />
  );
}

export function EducationList({
  editable,
  admin,
  talentProfileId,
  className,
}: TalentEntryListProps) {
  const mine = useMyEducations();
  const pub = usePublicEducations(talentProfileId ?? "");
  const mineMutations = {
    add: useAddEducation(),
    update: useUpdateEducation(),
    remove: useRemoveEducation(),
  };
  const adminMutations = useAdminEducations(talentProfileId ?? "");

  return (
    <EntryListEditor
      config={EDUCATION_CONFIG}
      items={talentProfileId ? pub.data : mine.data}
      isLoading={talentProfileId ? pub.isLoading : mine.isLoading}
      isError={talentProfileId ? pub.isError : mine.isError}
      editable={editable}
      add={admin ? adminMutations.add : mineMutations.add}
      update={admin ? adminMutations.update : mineMutations.update}
      remove={admin ? adminMutations.remove : mineMutations.remove}
      className={className}
    />
  );
}

export function CertificationList({
  editable,
  admin,
  talentProfileId,
  className,
}: TalentEntryListProps) {
  const mine = useMyCertifications();
  const pub = usePublicCertifications(talentProfileId ?? "");
  const mineMutations = {
    add: useAddCertification(),
    update: useUpdateCertification(),
    remove: useRemoveCertification(),
  };
  const adminMutations = useAdminCertifications(talentProfileId ?? "");

  return (
    <EntryListEditor
      config={CERTIFICATION_CONFIG}
      items={talentProfileId ? pub.data : mine.data}
      isLoading={talentProfileId ? pub.isLoading : mine.isLoading}
      isError={talentProfileId ? pub.isError : mine.isError}
      editable={editable}
      add={admin ? adminMutations.add : mineMutations.add}
      update={admin ? adminMutations.update : mineMutations.update}
      remove={admin ? adminMutations.remove : mineMutations.remove}
      className={className}
    />
  );
}
