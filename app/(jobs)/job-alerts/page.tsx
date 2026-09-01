"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Briefcase, MapPin, Pencil, Trash2, BadgeCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";
import {
 useJobAlerts,
 useCreateJobAlert,
 useUpdateJobAlert,
 useDeleteJobAlert,
} from "@/lib/hooks/use-job-alerts";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ErrorAlert } from "@/components/shared/error-alert";
import { FormInput } from "@/components/ui/form-input";
import { Switch } from "@/components/ui/switch";
import type { JobAlert } from "@/types/api/job-alerts";

interface AlertFormState {
 role: string;
 location: string;
 country: string;
 salaryMin: string;
 currency: string;
 skills: string;
}

const EMPTY_FORM: AlertFormState = {
 role: "",
 location: "",
 country: "",
 salaryMin: "",
 currency: "NGN",
 skills: "",
};

function formFromAlert(alert: JobAlert): AlertFormState {
 return {
 role: alert.role ?? "",
 location: alert.location ?? "",
 country: alert.country ?? "",
 salaryMin: alert.salaryMin != null ? String(alert.salaryMin) : "",
 currency: alert.currency ?? "NGN",
 skills: (alert.skills ?? []).join(", "),
 };
}

function formatSalary(alert: JobAlert): string {
 if (alert.salaryMin == null) return "";
 const value = alert.salaryMin.toLocaleString();
 return alert.currency ? `${alert.currency} ${value}+` : `${value}+`;
}

function JobAlertRow({
 alert,
 onEdit,
 onToggle,
 onDelete,
}: {
 alert: JobAlert;
 onEdit: () => void;
 onToggle: (active: boolean) => void;
 onDelete: () => void;
}) {
 const filters: string[] = [];
 if (alert.role) filters.push(alert.role);
 if (alert.location) filters.push(alert.location);
 if (alert.country) filters.push(alert.country);
 const salary = formatSalary(alert);
 if (salary) filters.push(salary);
 if (alert.skills.length > 0) filters.push(alert.skills.join(", "));

 return (
 <div
 className={`group flex flex-col gap-4 p-6 transition-colors sm:flex-row sm:items-center sm:justify-between ${
 alert.active ? "" : "opacity-60"
 }`}
 >
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <Bell className="h-3.5 w-3.5 text-muted-foreground" />
 <span
 className={`text-xs font-medium uppercase tracking-wide ${
 alert.active ? "text-emerald-600" : "text-muted-foreground"
 }`}
 >
 {alert.active ? "Active" : "Paused"}
 </span>
 </div>
 <div className="mt-2 flex flex-wrap gap-1.5">
 {filters.map((filter) => (
 <span
 key={filter}
 className=" border border-border/50 bg-muted px-3 py-1 text-xs text-muted-foreground"
 >
 {filter}
 </span>
 ))}
 {filters.length === 0 && (
 <span className="text-sm text-muted-foreground">No filters set</span>
 )}
 </div>
 <p className="mt-2 text-xs text-muted-foreground">
 We&apos;ll notify you when a new job matches these criteria.
 </p>
 </div>
 <div className="flex shrink-0 items-center gap-3">
 <span className="flex items-center gap-2 text-sm text-muted-foreground">
 Active
 <Switch
 checked={alert.active}
 onCheckedChange={(checked: boolean) => onToggle(checked)}
 size="sm"
 aria-label="Toggle job alert"
 />
 </span>
 <button
 type="button"
 onClick={onEdit}
 className="inline-flex h-9 items-center gap-1.5 border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
 >
 <Pencil className="h-3.5 w-3.5" />
 Edit
 </button>
 <button
 type="button"
 onClick={onDelete}
 className="inline-flex h-9 items-center gap-1.5 border border-border px-3 text-sm font-medium text-destructive transition-colors hover:border-destructive/50 hover:bg-destructive/5"
 >
 <Trash2 className="h-3.5 w-3.5" />
 Delete
 </button>
 </div>
 </div>
 );
}

export default function JobAlertsPage() {
 usePageTitle("Job Alerts");
 const { user } = useAuth();
 const myRoles = (user?.roles ?? []) as UserRole[];
 const isAdmin =
 myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
 const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

 const [form, setForm] = useState<AlertFormState>(EMPTY_FORM);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [pageError, setPageError] = useState<string | null>(null);

 const { data, isLoading, isError, error } = useJobAlerts(isTalent);
 const createAlert = useCreateJobAlert();
 const updateAlert = useUpdateJobAlert();
 const deleteAlert = useDeleteJobAlert();

 if (!isTalent) {
 return (
 <AnimatedContent className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
 <div className=" border border-border/15">
 <EmptyState
 icon={Briefcase}
 title="Sign in as a talent"
 description="Create a talent account to set job alerts and be notified when matching roles go live."
 action={
 <Link
 href="/login"
 className="inline-flex h-10 items-center justify-center bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
 >
 Sign in
 </Link>
 }
 />
 </div>
 </AnimatedContent>
 );
 }

 const setField = (field: keyof AlertFormState, value: string) =>
 setForm((prev) => ({ ...prev, [field]: value }));

 const resetForm = () => {
 setForm(EMPTY_FORM);
 setEditingId(null);
 };

 const submit = async (event: React.FormEvent) => {
 event.preventDefault();
 setPageError(null);
 const input = {
 role: form.role.trim() || undefined,
 location: form.location.trim() || undefined,
 country: form.country.trim() || undefined,
 salaryMin: form.salaryMin.trim() ? Number(form.salaryMin) : undefined,
 currency: form.currency.trim() || undefined,
 skills: form.skills
 .split(",")
 .map((skill) => skill.trim())
 .filter(Boolean),
 };

 if (!input.role && !input.location && !input.skills) {
 setPageError("Add at least a role, a location, or a skill.");
 return;
 }

 try {
 if (editingId) {
 await updateAlert.mutateAsync({ alertId: editingId, input });
 } else {
 await createAlert.mutateAsync(input);
 }
 resetForm();
 } catch (error) {
 setPageError(
 error instanceof Error ? error.message : "Failed to save job alert"
 );
 }
 };

 const toggle = async (alert: JobAlert, active: boolean) => {
 try {
 setPageError(null);
 await updateAlert.mutateAsync({ alertId: alert.id, input: { active } });
 } catch (error) {
 setPageError(
 error instanceof Error ? error.message : "Failed to update job alert"
 );
 }
 };

 const remove = async (alertId: string) => {
 try {
 setPageError(null);
 await deleteAlert.mutateAsync(alertId);
 if (editingId === alertId) resetForm();
 } catch (error) {
 setPageError(
 error instanceof Error ? error.message : "Failed to delete job alert"
 );
 }
 };

 const alerts = data?.alerts ?? [];
 const mutationPending =
 createAlert.isPending || updateAlert.isPending || deleteAlert.isPending;

 return (
 <AnimatedContent className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
 <div className="flex items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Job alerts</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 {alerts.length} saved alert{alerts.length === 1 ? "" : "s"} — we&apos;ll
 ping you the moment a matching job goes live.
 </p>
 </div>
 <Link
 href="/jobs"
 className="inline-flex h-10 shrink-0 items-center justify-center bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
 >
 Browse jobs
 </Link>
 </div>

 {(pageError || isError) && (
 <ErrorAlert
 message={
 pageError ??
 (error instanceof Error ? error.message : "Failed to load job alerts")
 }
 />
 )}

 <form
 onSubmit={submit}
 className=" border border-border bg-card p-6"
 >
 <div className="flex items-center gap-2">
 <Bell className="h-4 w-4 text-primary" />
 <h2 className="text-lg font-semibold tracking-tight">
 {editingId ? "Edit alert" : "New alert"}
 </h2>
 </div>
 <p className="mt-1 text-sm text-muted-foreground">
 {editingId
 ? "Adjust your criteria below. Changes apply to future job matches."
 : "Tell us what you're looking for and we'll match it against new jobs."}
 </p>

 <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
 <FormInput
 label="Role"
 placeholder="e.g. Backend Developer"
 value={form.role}
 onChange={(event) => setField("role", event.target.value)}
 maxLength={255}
 />
 <FormInput
 label="Location"
 placeholder="e.g. Remote, Lagos"
 value={form.location}
 onChange={(event) => setField("location", event.target.value)}
 maxLength={255}
 />
 <FormInput
 label="Country"
 placeholder="e.g. Nigeria"
 value={form.country}
 onChange={(event) => setField("country", event.target.value)}
 maxLength={100}
 />
 <div className="grid grid-cols-2 gap-3">
 <FormInput
 label="Min salary"
 type="number"
 min={1}
 placeholder="e.g. 300000"
 value={form.salaryMin}
 onChange={(event) => setField("salaryMin", event.target.value)}
 />
 <FormInput
 label="Currency"
 placeholder="NGN"
 maxLength={10}
 value={form.currency}
 onChange={(event) => setField("currency", event.target.value)}
 />
 </div>
 <div className="sm:col-span-2">
 <FormInput
 label="Skills"
 placeholder="e.g. Node.js, PostgreSQL, TypeScript"
 value={form.skills}
 onChange={(event) => setField("skills", event.target.value)}
 maxLength={400}
 />
 </div>
 </div>

 <div className="mt-5 flex items-center gap-3">
 <button
 type="submit"
 disabled={mutationPending}
 className="inline-flex h-10 items-center justify-center bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
 >
 {mutationPending
 ? "Saving…"
 : editingId
 ? "Save changes"
 : "Create alert"}
 </button>
 {editingId && (
 <button
 type="button"
 onClick={resetForm}
 className="inline-flex h-10 items-center justify-center border border-border px-5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
 >
 Cancel
 </button>
 )}
 </div>
 </form>

 {isLoading ? (
 <div className="space-y-4">
 {Array.from({ length: 2 }).map((_, i) => (
 <div
 key={i}
 className="h-28 animate-pulse border border-border/15 bg-muted"
 />
 ))}
 </div>
 ) : alerts.length === 0 ? (
 <div className=" border border-border/15">
 <EmptyState
 icon={BadgeCheck}
 title="No job alerts yet"
 description="Create your first alert above and we'll notify you when matching jobs are published."
 />
 </div>
 ) : (
 <div className="divide-y divide-border border border-border bg-card">
 {alerts.map((alert) => (
 <JobAlertRow
 key={alert.id}
 alert={alert}
 onEdit={() => {
 setEditingId(alert.id);
 setForm(formFromAlert(alert));
 setPageError(null);
 }}
 onToggle={(active) => toggle(alert, active)}
 onDelete={() => remove(alert.id)}
 />
 ))}
 </div>
 )}

 <div className="flex items-start gap-2 border border-border/15 bg-muted/40 p-4 text-sm text-muted-foreground">
 <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
 <p>
 Alerts match jobs the moment they are published. Turn them off any time
 with the switch, or manage delivery in{" "}
 <Link href="/settings" className="underline underline-offset-2">
 notification settings
 </Link>
 .
 </p>
 </div>
 </AnimatedContent>
 );
}