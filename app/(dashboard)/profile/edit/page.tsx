"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  LoaderCircle,
  Save,
  Upload,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useClientProfile,
  useTalentProfile,
  useUpdateClientProfile,
  useUpdateTalentProfile,
  useUpdateTalentProfileVisibility,
  type ClientProfileData,
} from "@/lib/hooks/use-profiles";
import { useUploadCv } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import {
  AccountType,
  EmploymentType,
  UserRole,
  WorkPreference,
} from "@/types/api/auth";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import type { UserData } from "@/lib/auth/types";
import { AnimatedContent } from "@/components/shared/animated-content";
import { SectionCard } from "@/components/shared/section-card";
import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { DocumentUpload } from "@/components/shared/document-upload";
import {
  CertificationList,
  EducationList,
  WorkExperienceList,
} from "@/components/profile/talent-entry-list";
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

const TALENT_EMPTY_FORM = {
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

type TalentFormState = typeof TALENT_EMPTY_FORM;

function TalentProfileEdit() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useTalentProfile();
  const update = useUpdateTalentProfile();
  const updateVisibility = useUpdateTalentProfileVisibility();
  const cvUpload = useUploadCv();

  const [form, setForm] = useState<TalentFormState>(TALENT_EMPTY_FORM);
  const [cvName, setCvName] = useState<string | null>(null);
  const [profileFormId, setProfileFormId] = useState<string | null>(null);

  if (profile && profile.id !== profileFormId) {
    setProfileFormId(profile.id);
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
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load your profile."}
      </div>
    );
  }

  const set = (key: keyof TalentFormState) => (value: string) =>
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

  const handleSave = () => {
    update.mutate(
      {
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
          toast.error(
            err instanceof Error ? err.message : "Failed to save profile"
          ),
      }
    );
  };

  const initials =
    [form.firstName, form.lastName]
      .filter(Boolean)
      .map((name) => name[0]?.toUpperCase() ?? "")
      .join("") || "T";
  const isPublic = profile.visibility !== "private";

  return (
    <div className="space-y-6">
      <SectionCard title="Picture & visibility">
        <div className="flex flex-wrap items-center gap-6">
          <AvatarUpload
            avatarUrl={profile.avatarUrl ?? user?.avatarUrl}
            fallback={initials}
            onUploaded={() => void refetch()}
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {isPublic ? "Public" : "Private"}
            </span>
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
        </div>
      </SectionCard>

      <SectionCard title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required>
            <Input
              value={form.firstName}
              onChange={(e) => set("firstName")(e.target.value)}
            />
          </Field>
          <Field label="Last name" required>
            <Input
              value={form.lastName}
              onChange={(e) => set("lastName")(e.target.value)}
            />
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
            <Input
              value={form.country}
              onChange={(e) => set("country")(e.target.value)}
            />
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
            <Select
              value={form.employmentType || undefined}
              onValueChange={set("employmentType")}
            >
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
            <Select
              value={form.workPreference || undefined}
              onValueChange={set("workPreference")}
            >
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

      <WorkExperienceList editable />
      <EducationList editable />
      <CertificationList editable />

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

      <SectionCard title="Documents">
        <DocumentUpload label="Upload a document" />
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={update.isPending}>
          <Save className="h-4 w-4" />
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

const CLIENT_EMPTY_FORM = {
  companyName: "",
  industry: "",
  companySize: "",
  website: "",
  country: "",
  companyDescription: "",
  logoUrl: "",
  contactFirstName: "",
  contactLastName: "",
  phone: "",
};

type ClientFormState = typeof CLIENT_EMPTY_FORM;

function mapClientProfileToForm(profile: ClientProfileData): ClientFormState {
  return {
    companyName: profile.companyName ?? "",
    industry: profile.industry ?? "",
    companySize: profile.companySize ?? "",
    website: profile.website ?? "",
    country: profile.country ?? "",
    companyDescription: profile.companyDescription ?? "",
    logoUrl: profile.logoUrl ?? "",
    contactFirstName: profile.contactFirstName ?? "",
    contactLastName: profile.contactLastName ?? "",
    phone: profile.phone ?? "",
  };
}

function ClientProfileEdit() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useClientProfile();
  const update = useUpdateClientProfile();
  const [form, setForm] = useState<ClientFormState>(CLIENT_EMPTY_FORM);
  const [profileFormId, setProfileFormId] = useState<string | null>(null);

  if (profile && profile.id !== profileFormId) {
    setProfileFormId(profile.id);
    setForm(mapClientProfileToForm(profile));
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Could not load your company profile."}
      </div>
    );
  }

  const set = (key: keyof ClientFormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    update.mutate(
      {
        companyName: form.companyName.trim() || undefined,
        industry: form.industry.trim() || undefined,
        companySize: form.companySize.trim() || undefined,
        website: form.website.trim() || undefined,
        country: form.country.trim() || undefined,
        companyDescription: form.companyDescription.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        contactFirstName: form.contactFirstName.trim() || undefined,
        contactLastName: form.contactLastName.trim() || undefined,
        phone: form.phone.trim() || undefined,
      },
      {
        onSuccess: () => toast.success("Company profile updated"),
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to save profile"
          ),
      }
    );
  };

  const initials =
    form.companyName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "C";

  return (
    <div className="space-y-6">
      <SectionCard title="Logo">
        <AvatarUpload
          avatarUrl={profile.logoUrl ?? user?.avatarUrl}
          fallback={initials}
          onUploaded={() => void refetch()}
        />
      </SectionCard>

      <SectionCard title="Company">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required>
            <Input
              value={form.companyName}
              onChange={(e) => set("companyName")(e.target.value)}
            />
          </Field>
          <Field label="Industry">
            <Input
              value={form.industry}
              onChange={(e) => set("industry")(e.target.value)}
              placeholder="e.g. Fintech"
            />
          </Field>
          <Field label="Company size">
            <Input
              value={form.companySize}
              onChange={(e) => set("companySize")(e.target.value)}
              placeholder="e.g. 51-200"
            />
          </Field>
          <Field label="Country">
            <Input
              value={form.country}
              onChange={(e) => set("country")(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Website">
              <Input
                value={form.website}
                onChange={(e) => set("website")(e.target.value)}
                placeholder="https://"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Company description">
              <Textarea
                value={form.companyDescription}
                onChange={(e) => set("companyDescription")(e.target.value)}
                placeholder="Tell applicants about your company and mission."
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact person">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required>
            <Input
              value={form.contactFirstName}
              onChange={(e) => set("contactFirstName")(e.target.value)}
            />
          </Field>
          <Field label="Last name" required>
            <Input
              value={form.contactLastName}
              onChange={(e) => set("contactLastName")(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Documents">
        <DocumentUpload label="Upload a document" />
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={update.isPending}>
          <Save className="h-4 w-4" />
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function AdminProfileEdit({ user }: { user: UserData }) {
  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <SectionCard title="Picture">
      <AvatarUpload avatarUrl={user.avatarUrl} fallback={initials} />
    </SectionCard>
  );
}

export default function ProfileEditPage() {
  usePageTitle("Edit profile");
  const { user } = useAuth();

  const myRoles = ((user?.roles ?? []) as UserRole[]);
  const isAdmin =
    myRoles.includes(UserRole.ADMIN) || myRoles.includes(UserRole.SUPER_ADMIN);
  const isClient = user?.accountType === AccountType.CLIENT && !isAdmin;
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  return (
    <AnimatedContent className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit profile"
        description="Update your profile information."
        backHref="/profile"
      />
      {!user ? (
        <Skeleton className="h-44 rounded-xl" />
      ) : isAdmin ? (
        <AdminProfileEdit user={user} />
      ) : isClient ? (
        <ClientProfileEdit />
      ) : isTalent ? (
        <TalentProfileEdit />
      ) : (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Profile editing is not available for this account type.
        </div>
      )}
    </AnimatedContent>
  );
}
