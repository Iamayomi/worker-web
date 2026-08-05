import Link from "next/link";
import { MapPin, Building2, Clock } from "lucide-react";
import type { Job } from "@/types/api/jobs";
import { Badge } from "@/components/ui/badge";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";

const employmentLabel = (value: string) =>
  EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;

const preferenceLabel = (value: string) =>
  WORK_PREFERENCES.find((t) => t.value === value)?.label ?? value;

export function formatSalary(job: Job): string {
  if (job.salaryMin == null && job.salaryMax == null) return "Salary negotiable";
  const currency = (job.currency ?? "USD").toUpperCase();
  const min = job.salaryMin != null ? `${currency} ${job.salaryMin.toLocaleString()}` : null;
  const max = job.salaryMax != null ? `${currency} ${job.salaryMax.toLocaleString()}` : null;
  if (min && max) return `${min} – ${max}`;
  return (min ?? max) ?? "Salary negotiable";
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="block rounded-xl border border-border/15 bg-card p-5 transition-colors hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{job.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {job.companyName && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {job.companyName}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {job.matchLabel && (
            <Badge className="shrink-0 bg-emerald-500/10 text-emerald-600">
              {job.matchLabel}
            </Badge>
          )}
          <SaveJobButton jobId={job.id} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{employmentLabel(job.employmentType)}</Badge>
        <Badge variant="secondary">{preferenceLabel(job.workPreference)}</Badge>
        {job.experienceRequired && (
          <Badge variant="secondary">{job.experienceRequired}</Badge>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{formatSalary(job)}</p>
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Closes {formatDate(job.expiresAt)}
        </p>
      </div>

      {job.skillsRequired.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {job.skillsRequired.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {job.skillsRequired.length > 5 && (
            <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
              +{job.skillsRequired.length - 5} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
