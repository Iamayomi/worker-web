"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Send,
  Loader2,
  Search,
  FileText,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  usePreviewEmailTemplate,
  useSendTestEmail,
} from "@/lib/hooks/use-email-templates";
import type { EmailTemplateData } from "@/lib/types/email-templates";
import {
  EmailTemplateCategory,
  EmailTemplateStatus,
} from "@/lib/types/email-templates";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContent } from "@/components/shared/animated-content";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormSelect } from "@/components/ui/form-select";
import { FormInput } from "@/components/ui/form-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORY_OPTIONS = Object.values(EmailTemplateCategory).map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const STATUS_OPTIONS = Object.values(EmailTemplateStatus).map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const CATEGORY_STYLES: Record<string, string> = {
  transactional: "bg-blue-500/10 text-blue-600",
  marketing: "bg-purple-500/10 text-purple-600",
  notification: "bg-amber-500/10 text-amber-600",
  lifecycle: "bg-emerald-500/10 text-emerald-600",
  business: "bg-rose-500/10 text-rose-600",
  system: "bg-slate-500/10 text-slate-600",
};

function formatDate(value: Date | string | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplateData | null;
  onSaved: () => void;
}) {
  const isEdit = !!template;

  const [name, setName] = useState(template?.name ?? "");
  const [key, setKey] = useState(template?.key ?? "");
  const [category, setCategory] = useState<EmailTemplateCategory>(
    template?.category ?? EmailTemplateCategory.TRANSACTIONAL,
  );
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [htmlContent, setHtmlContent] = useState(template?.html_content ?? "");
  const [textContent, setTextContent] = useState(template?.text_content ?? "");
  const [status, setStatus] = useState<EmailTemplateStatus>(
    template?.status ?? EmailTemplateStatus.DRAFT,
  );

  const create = useCreateEmailTemplate();
  const update = useUpdateEmailTemplate();

  const handleSubmit = async () => {
    const payload = {
      name,
      category,
      subject,
      html_content: htmlContent,
      text_content: textContent || undefined,
    };

    if (isEdit) {
      await update.mutateAsync({
        id: template!.id,
        input: { ...payload, status },
      });
    } else {
      await create.mutateAsync({
        ...payload,
        key,
        status,
      });
    }
    onSaved();
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit email template" : "New email template"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the template content. Active changes apply to newly sent emails."
              : "Create a reusable email template. Use {{variable}} placeholders."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {!isEdit && (
              <FormInput
                label="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="email-verification"
                required
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              label="Category"
              value={category}
              onValueChange={(v) => setCategory(v as EmailTemplateCategory)}
              options={CATEGORY_OPTIONS}
            />
            <FormSelect
              label="Status"
              value={status}
              onValueChange={(v) => setStatus(v as EmailTemplateStatus)}
              options={STATUS_OPTIONS}
            />
          </div>

          <FormInput
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <FormTextarea
            label="HTML content"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="<h1>Hi {{name}}</h1><p>Your code is {{code}}</p>"
            className="min-h-40 font-mono text-xs"
            required
          />

          <FormTextarea
            label="Plain text content (optional)"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Hi {{name}}, your code is {{code}}."
            className="min-h-24 font-mono text-xs"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !name || !subject || !htmlContent}>
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isEdit ? "Save changes" : "Create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplateData | null;
}) {
  const preview = usePreviewEmailTemplate();
  const sendTest = useSendTestEmail();
  const [testEmail, setTestEmail] = useState("");

  const initialVariables = useMemo(() => {
    const prefill: Record<string, string> = {};
    template?.variables.forEach((v) => {
      prefill[v] = "";
    });
    return prefill;
  }, [template]);
  const [variables, setVariables] =
    useState<Record<string, string>>(initialVariables);

  if (!template) return null;

  const missing = template.variables.filter((v) => !variables[v]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview — {template.name}</DialogTitle>
          <DialogDescription>
            Fill in the template variables to preview the rendered output.
          </DialogDescription>
        </DialogHeader>

        {template.variables.length > 0 && (
          <div className="grid gap-3 border border-border/15 bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Variables</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {template.variables.map((v) => (
                <div key={v} className="space-y-1.5">
                  <Label className="font-mono text-xs">{v}</Label>
                  <Input
                    value={variables[v] ?? ""}
                    onChange={(e) =>
                      setVariables((prev) => ({ ...prev, [v]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Rendered preview</Label>
          <div className="border border-border/15 bg-white p-4 text-sm text-slate-900">
            <div className="mb-2 border-b border-dashed border-slate-200 pb-2 text-xs font-semibold uppercase text-slate-500">
              Subject:{" "}
              {preview.data?.subject ??
                template.subject.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] ?? "")}
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  preview.data?.html ??
                  template.html_content.replace(
                    /\{\{(\w+)\}\}/g,
                    (_, k) => variables[k] ?? "",
                  ),
              }}
            />
          </div>
        </div>

        <div className="grid gap-3 border-t border-border/15 pt-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label>Send test email to</Label>
            <Input
              type="email"
              placeholder="admin@company.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={() => preview.mutate({ id: template.id, variables })}
              disabled={preview.isPending}
            >
              {preview.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Render
            </Button>
            <Button
              disabled={sendTest.isPending || !testEmail}
              onClick={() =>
                sendTest
                  .mutateAsync({
                    id: template.id,
                    to: testEmail,
                    variables,
                  })
                  .then(() => toast.success("Test email sent"))
                  .catch((err) =>
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Failed to send test email",
                    ),
                  )
              }
            >
              {sendTest.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send test
            </Button>
          </div>
          {missing.length > 0 && (
            <p className="col-span-full text-xs text-amber-600 sm:col-span-2">
              Unfilled variables (rendered as empty): {missing.join(", ")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminEmailTemplatesPage() {
  const { user } = useAuth();
  const isAdmin = (user?.roles ?? []).some(
    (r) => r === "super_admin" || r === "admin",
  );

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplateData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplateData | null>(
    null,
  );
  const [previewTarget, setPreviewTarget] = useState<EmailTemplateData | null>(
    null,
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error } = useEmailTemplates(
    isAdmin
      ? {
          category,
          status,
          search: debouncedSearch,
        }
      : {},
  );

  const deleteMutation = useDeleteEmailTemplate();

  if (!isAdmin) {
    return <ErrorAlert message="You don't have access to this page." />;
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    toast.success("Email template deleted");
    setDeleteTarget(null);
  };

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (t: EmailTemplateData) => {
    setEditing(t);
    setEditorOpen(true);
  };

  const templates = data?.templates ?? [];
  const total = data?.total ?? 0;

  return (
    <AnimatedContent className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Email templates"
          description="Manage email templates used across the platform. Changes apply at send time."
        />
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New template
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or key…"
            className="pl-9"
          />
        </div>
        <FormSelect
          value={category}
          onValueChange={setCategory}
          options={[{ value: "", label: "All categories" }, ...CATEGORY_OPTIONS]}
          className="w-44"
        />
        <FormSelect
          value={status}
          onValueChange={setStatus}
          options={[{ value: "", label: "All statuses" }, ...STATUS_OPTIONS]}
          className="w-40"
        />
      </div>

      {isError && (
        <ErrorAlert
          message={
            error instanceof Error
              ? error.message
              : "Failed to load email templates"
          }
        />
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : templates.length === 0 ? (
        <div className="border border-border/15">
          <EmptyState
            icon={Mail}
            title="No email templates"
            description="Create your first email template to start sending branded messages."
          />
        </div>
      ) : (
        <div className="overflow-hidden border border-border bg-card">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1.4fr] gap-4 border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid">
            <span>Template</span>
            <span>Category</span>
            <span>Status</span>
            <span>Variables</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-border/60">
            {templates.map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-1 gap-2 px-4 py-3.5 sm:grid-cols-[2fr_1fr_1fr_1fr_1.4fr] sm:items-center"
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setPreviewTarget(t)}
                    className="block max-w-full truncate text-left text-sm font-semibold text-foreground hover:underline"
                  >
                    {t.name}
                  </button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{t.key}</span>
                    <span>·</span>
                    <span>{formatDate(t.updated_at)}</span>
                  </div>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={`capitalize ${CATEGORY_STYLES[t.category] ?? ""}`}
                  >
                    {t.category}
                  </Badge>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className="capitalize"
                  >
                    {t.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t.variables.length > 0 ? t.variables.length : "None"}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewTarget(t)}
                    title="Preview / test-send"
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    title="Edit"
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(t)}
                    title="Delete"
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {total > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          {total} template{total === 1 ? "" : "s"}
        </p>
      )}

      <TemplateEditorDialog
        key={editing?.id ?? "new"}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editing}
        onSaved={() => {
          toast.success(editing ? "Template updated" : "Template created");
          setEditorOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete email template?"
        message={`This will permanently delete "${deleteTarget?.name}". Templates still referenced by pending emails may fail to send.`}
        confirmLabel="Delete"
        destructive
      />

      <PreviewDialog
        key={previewTarget?.id ?? "none"}
        open={!!previewTarget}
        onOpenChange={(open) => !open && setPreviewTarget(null)}
        template={previewTarget}
      />
    </AnimatedContent>
  );
}
