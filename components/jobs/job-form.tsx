"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormSelect } from "@/components/ui/form-select";
import { Button } from "@/components/ui/button";
import {
  APPLICATION_TYPES,
  CURRENCIES,
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  WORK_PREFERENCES,
} from "@/lib/constants/enums";
import {
  ApplicationType,
  JobStatus,
  type CreateJobInput,
  type Job,
} from "@/types/api/jobs";
import type { EmploymentType, WorkPreference } from "@/types/api/auth";

const DEFAULT_EXPIRY = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

interface JobFormProps {
  initial?: Job;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (data: CreateJobInput) => void;
}

function toCreateInput(form: {
  title: string;
  description: string;
  category: string;
  employmentType: string;
  workPreference: string;
  location: string;
  country: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  skills: string;
  experienceRequired: string;
  status: string;
  applicationType: string;
  applicationEmail: string;
  applicationExternalUrl: string;
  expiresAt: string;
}): CreateJobInput {
  const applicationType = form.applicationType as ApplicationType;
  return {
    title: form.title,
    description: form.description,
    category: form.category || undefined,
    employmentType: form.employmentType as EmploymentType,
    workPreference: form.workPreference as WorkPreference,
    location: form.location,
    country: form.country || undefined,
    salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
    salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    currency: form.currency || undefined,
    skillsRequired: form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experienceRequired: form.experienceRequired || undefined,
    status: form.status as JobStatus,
    applicationType,
    applicationEmail:
      applicationType === ApplicationType.EMAIL
        ? form.applicationEmail
        : undefined,
    applicationExternalUrl:
      applicationType === ApplicationType.EXTERNAL_LINK
        ? form.applicationExternalUrl
        : undefined,
    expiresAt: form.expiresAt,
  };
}

export function JobForm({ initial, submitLabel, submitting, onSubmit }: JobFormProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    employmentType: initial?.employmentType ?? "",
    workPreference: initial?.workPreference ?? "",
    location: initial?.location ?? "",
    country: initial?.country ?? "",
    salaryMin: initial?.salaryMin != null ? String(initial.salaryMin) : "",
    salaryMax: initial?.salaryMax != null ? String(initial.salaryMax) : "",
    currency: initial?.currency ?? "usd",
    skills: (initial?.skillsRequired ?? []).join(", "),
    experienceRequired: initial?.experienceRequired ?? "",
    status: initial?.status ?? JobStatus.DRAFT,
    applicationType: initial?.applicationType ?? ApplicationType.EASY_APPLY,
    applicationEmail: initial?.applicationEmail ?? "",
    applicationExternalUrl: initial?.applicationExternalUrl ?? "",
    expiresAt: initial?.expiresAt
      ? initial.expiresAt.slice(0, 10)
      : DEFAULT_EXPIRY,
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applicationMethodComplete =
    form.applicationType === ApplicationType.EMAIL
      ? Boolean(form.applicationEmail.trim())
      : form.applicationType === ApplicationType.EXTERNAL_LINK
        ? Boolean(form.applicationExternalUrl.trim())
        : true;

  const canSubmit =
    form.title.trim() &&
    form.description.trim() &&
    form.employmentType &&
    form.workPreference &&
    form.location.trim() &&
    form.expiresAt &&
    applicationMethodComplete;

  const statusOptions = initial
    ? JOB_STATUSES
    : JOB_STATUSES.filter((s) => s.value === "draft" || s.value === "published");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit && !submitting) onSubmit(toCreateInput(form));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormInput
            label="Job title"
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            placeholder="e.g. Senior Backend Engineer"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <FormTextarea
            label="Description"
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            placeholder="Describe the role, responsibilities, and what you're looking for."
            rows={6}
            required
          />
        </div>
        <FormInput
          label="Category"
          value={form.category}
          onChange={(e) => set("category")(e.target.value)}
          placeholder="e.g. Engineering"
        />
        <FormInput
          label="Experience required"
          value={form.experienceRequired}
          onChange={(e) => set("experienceRequired")(e.target.value)}
          placeholder="e.g. 3+ years"
        />
        <FormSelect
          label="Employment type"
          value={form.employmentType}
          onValueChange={(v) => set("employmentType")(v)}
          options={EMPLOYMENT_TYPES}
          placeholder="Select type"
          required
        />
        <FormSelect
          label="Work preference"
          value={form.workPreference}
          onValueChange={(v) => set("workPreference")(v)}
          options={WORK_PREFERENCES}
          placeholder="Select preference"
          required
        />
        <FormInput
          label="Location"
          value={form.location}
          onChange={(e) => set("location")(e.target.value)}
          placeholder="e.g. Accra, Ghana"
          required
        />
        <FormInput
          label="Country"
          value={form.country}
          onChange={(e) => set("country")(e.target.value)}
          placeholder="e.g. Ghana"
        />
        <div className="sm:col-span-2">
          <FormInput
            label="Required skills"
            value={form.skills}
            onChange={(e) => set("skills")(e.target.value)}
            placeholder="e.g. Node.js, TypeScript, PostgreSQL"
          />
        </div>
        <FormInput
          label="Salary min (optional)"
          type="number"
          min={0}
          value={form.salaryMin}
          onChange={(e) => set("salaryMin")(e.target.value)}
        />
        <FormInput
          label="Salary max (optional)"
          type="number"
          min={0}
          value={form.salaryMax}
          onChange={(e) => set("salaryMax")(e.target.value)}
        />
        <FormSelect
          label="Currency"
          value={form.currency}
          onValueChange={(v) => set("currency")(v)}
          options={CURRENCIES}
        />
        <FormInput
          label="Application deadline"
          type="date"
          value={form.expiresAt}
          onChange={(e) => set("expiresAt")(e.target.value)}
          required
        />
        <FormSelect
          label="Status"
          value={form.status}
          onValueChange={(v) => set("status")(v)}
          options={statusOptions}
        />
        <div className="sm:col-span-2">
          <FormSelect
            label="How do you want to receive applications?"
            value={form.applicationType}
            onValueChange={(v) => set("applicationType")(v)}
            options={APPLICATION_TYPES}
          />
        </div>
        {form.applicationType === ApplicationType.EMAIL && (
          <div className="sm:col-span-2">
            <FormInput
              label="Application email"
              type="email"
              value={form.applicationEmail}
              onChange={(e) => set("applicationEmail")(e.target.value)}
              placeholder="e.g. jobs@acme.com"
              required
            />
          </div>
        )}
        {form.applicationType === ApplicationType.EXTERNAL_LINK && (
          <div className="sm:col-span-2">
            <FormInput
              label="Application link"
              type="url"
              value={form.applicationExternalUrl}
              onChange={(e) => set("applicationExternalUrl")(e.target.value)}
              placeholder="e.g. https://acme.com/careers"
              required
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <LoaderCircle className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
