"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Save } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useClientProfile,
  useUpdateClientProfile,
  type ClientProfileData,
} from "@/lib/hooks/use-profiles";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { AccountType } from "@/types/api/auth";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface FormState {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  country: string;
  companyDescription: string;
  logoUrl: string;
  contactFirstName: string;
  contactLastName: string;
  phone: string;
}

function mapProfileToForm(profile: ClientProfileData): FormState {
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

function ClientProfileForm({ profile }: { profile: ClientProfileData }) {
  const update = useUpdateClientProfile();
  const [form, setForm] = useState<FormState>(() => mapProfileToForm(profile));

  const set = (key: keyof FormState) => (value: string) =>
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

  const isVerified = profile.verificationStatus === "verified";

  return (
    <>
      <PageHeader
        title="Company profile"
        description="Information shown on your job listings and to applicants."
        actions={
          <Button onClick={handleSave} disabled={update.isPending}>
            <Save className="h-4 w-4" />
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
        }
      />

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
          <div className="sm:col-span-2">
            <Field label="Logo URL">
              <Input
                value={form.logoUrl}
                onChange={(e) => set("logoUrl")(e.target.value)}
                placeholder="https://"
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
            <Input
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
            />
          </Field>
          {isVerified && (
            <div className="flex items-end pb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified company
              </span>
            </div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

export default function ClientProfilePage() {
  usePageTitle("Company profile");
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error } = useClientProfile();

  if (user?.accountType !== AccountType.CLIENT) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Company profile management is available for client accounts.
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
        </div>
      </AnimatedContent>
    );
  }

  if (isError || !profile) {
    return (
      <AnimatedContent className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Could not load your company profile."}
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent className="mx-auto max-w-3xl space-y-6">
      <ClientProfileForm key={profile.id} profile={profile} />
    </AnimatedContent>
  );
}
