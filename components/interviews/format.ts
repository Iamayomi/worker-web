import type { InterviewType } from "@/types/api/interviews";
import { INTERVIEW_TYPE_LABEL } from "@/lib/constants/status";

export function formatInterviewDate(iso: string, timezone?: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone || undefined,
  });
}

export function formatInterviewTime(iso: string, timezone?: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone || undefined,
  });
}

export function interviewTypeLabel(type: InterviewType | string): string {
  return INTERVIEW_TYPE_LABEL[type] ?? type;
}

export function downloadIcs(ics: string, filename: string): void {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
