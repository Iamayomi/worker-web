"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { FileText, LoaderCircle, Save, Share2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useTalentProfile,
  useUpdateTalentProfile,
  useUpdateTalentProfileVisibility,
} from "@/lib/hooks/use-profiles";
import { useUploadCv } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { AccountType, EmploymentType, WorkPreference } from "@/types/api/auth";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { TalentAnalyticsView } from "@/components/analytics/analytics-views";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  professionalTitle: "",
  bio: "",
  country: "",
  stateOfResidence: "",
  phone: "",
  yearsOfExperience: "",
  employmentType: "",
  workPreference: "",
  skills: "",
  resumeUrl: "",
  portfolioUrl: "",
  linkedinUrl: "",
};

type FormState = typeof EMPTY_FORM;

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-foreground"> *</span>}
      </Label>
      {children}
    </div>
  );
}

export default function TalentProfilePage() {
  usePageTitle("Profile");
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error } = useTalentProfile();
  const update = useUpdateTalentProfile();
  const updateVisibility = useUpdateTalentProfileVisibility();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [cvName, setCvName] = useState<string | null>(null);
  const cvUpload = useUploadCv();

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      professionalTitle: profile.professionalTitle ?? "",
      bio: profile.bio ?? "",
      country: profile.country ?? "",
      stateOfResidence: profile.stateOfResidence ?? "",
      phone: profile.phone ?? "",
      yearsOfExperience:
        profile.yearsOfExperience != null
          ? String(profile.yearsOfExperience)
          : "",
      employmentType: profile.employmentType ?? "",
      workPreference: profile.workPreference ?? "",
      skills: (profile.skills ?? []).join(", "),
      resumeUrl: profile.resumeUrl ?? "",
      portfolioUrl: profile.portfolioUrl ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
    });
  }, [profile]);

  if (user?.accountType !== AccountType.TALENT) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Profile management is available for talent accounts.
          </div>
        </div>
      </AnimatedContent>
    );
  }

  if (isLoading) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      </AnimatedContent>
    );
  }

  if (isError || !profile) {
    return (
      <AnimatedContent className="mx-auto max-w-2xl">
        <div className="space-y-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p>
            {error instanceof Error
              ? error.message
              : "Could not load your profile."}
          </p>
          <p className="text-muted-foreground">
            Haven&apos;t completed registration?{" "}
            <Link
              href="/complete-profile"
              className="font-medium text-primary underline"
            >
              Finish setting up your profile
            </Link>
            .
          </p>
        </div>
      </AnimatedContent>
    );
  }

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleCvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("CV must be under 10MB");
      return;
    }
    cvUpload.mutate(file, {
      onSuccess: (data) => {
        setForm((f) => ({ ...f, resumeUrl: data.url }));
        setCvName(file.name);
        toast.success("CV uploaded");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to upload CV"),
    });
  };

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/talent/${profile.id}`
      );
      toast.success("Profile link copied");
    } catch {
      toast.error("Could not copy profile link");
    }
  };

  const handleSave = () => {
    update.mutate({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        professionalTitle: form.professionalTitle.trim() || undefined,
        bio: form.bio.trim() || undefined,
        country: form.country.trim() || undefined,
        stateOfResidence: form.stateOfResidence.trim() || undefined,
        phone: form.phone.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience
          ? Number(form.yearsOfExperience)
          : undefined,
        employmentType: (form.employmentType || undefined) as
          | EmploymentType
          | undefined,
        workPreference: (form.workPreference || undefined) as
          | WorkPreference
          | undefined,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        resumeUrl: form.resumeUrl.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
      },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save profile"),
      }
    );
  };

  const isPublic = profile.visibility !== "private";

  return (
    <AnimatedContent className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description="Your public talent profile used to match you with jobs."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleShareProfile}>
              <Share2 className="h-4 w-4" />
              Share profile
            </Button>
            <Button onClick={handleSave} disabled={update.isPending}>
              <Save className="h-4 w-4" />
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        }
      />

      <SectionCard title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required>
            <Input value={form.firstName} onChange={(e) => set("firstName")(e.target.value)} />
          </Field>
          <Field label="Last name" required>
            <Input value={form.lastName} onChange={(e) => set("lastName")(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Professional title">
              <Input
                value={form.professionalTitle}
                onChange={(e) => set("professionalTitle")(e.target.value)}
                placeholder="Senior Software Engineer"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Bio">
              <Textarea
                value={form.bio}
                onChange={(e) => set("bio")(e.target.value)}
                placeholder="Tell clients about your experience and interests."
              />
            </Field>
          </div>
          <Field label="Country">
            <Input value={form.country} onChange={(e) => set("country")(e.target.value)} />
          </Field>
          <Field label="State of residence">
            <Input
              value={form.stateOfResidence}
              onChange={(e) => set("stateOfResidence")(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Experience">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Years of experience">
            <Input
              type="number"
              min={0}
              value={form.yearsOfExperience}
              onChange={(e) => set("yearsOfExperience")(e.target.value)}
            />
          </Field>
          <Field label="Employment type">
            <Select value={form.employmentType || undefined} onValueChange={set("employmentType")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Work preference">
            <Select value={form.workPreference || undefined} onValueChange={set("workPreference")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select work preference" />
              </SelectTrigger>
              <SelectContent>
                {WORK_PREFERENCES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Skills">
              <Input
                value={form.skills}
                onChange={(e) => set("skills")(e.target.value)}
                placeholder="TypeScript, Node.js, React"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Comma-separated list of skills.
              </p>
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Links">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="CV / Résumé">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
                  <Upload className="h-4 w-4" />
                  {form.resumeUrl ? "Replace CV" : "Upload CV"}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={handleCvFile}
                    disabled={cvUpload.isPending}
                  />
                </label>
                {cvUpload.isPending && (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                )}
                {form.resumeUrl && !cvUpload.isPending && (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <a
                      href={form.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {cvName || "View CV"}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, resumeUrl: "" }));
                        setCvName(null);
                      }}
                      className="text-xs font-medium text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a PDF up to 10MB. Your CV is shared with clients when you
                apply to a job.
              </p>
            </Field>
          </div>
          <Field label="Resume URL">
            {form.resumeUrl ? (
              <div className="flex h-10 items-center gap-2 rounded-md border border-border/15 bg-muted/30 px-3 text-sm">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href={form.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-primary hover:underline"
                >
                  {cvName || "Uploaded CV"}
                </a>
              </div>
            ) : (
              <Input
                value={form.resumeUrl}
                onChange={(e) => set("resumeUrl")(e.target.value)}
                placeholder="https://"
              />
            )}
          </Field>
          <Field label="Portfolio URL">
            <Input
              value={form.portfolioUrl}
              onChange={(e) => set("portfolioUrl")(e.target.value)}
              placeholder="https://"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="LinkedIn URL">
              <Input
                value={form.linkedinUrl}
                onChange={(e) => set("linkedinUrl")(e.target.value)}
                placeholder="https://linkedin.com/in/"
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Visibility">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Public profile</p>
            <p className="text-xs text-muted-foreground">
              When public, clients can view your full profile when reviewing an
              application. When private, only your name and title are shown.
            </p>
          </div>
          <Switch
            checked={isPublic}
            disabled={updateVisibility.isPending}
            onCheckedChange={(checked) =>
              updateVisibility.mutate(checked ? "public" : "private", {
                onSuccess: () =>
                  toast.success(
                    checked ? "Profile is now public" : "Profile is now private"
                  ),
                onError: (err) =>
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to update visibility"
                  ),
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Analytics">
        <TalentAnalyticsView />
      </SectionCard>
    </AnimatedContent>
  );
}
