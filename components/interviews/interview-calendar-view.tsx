"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
 CalendarDays,
 ChevronLeft,
 ChevronRight,
 Download,
 Globe,
 List,
} from "lucide-react";
import { useInterviewCalendar } from "@/lib/hooks/use-interviews";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { InterviewStatusBadge } from "./interview-status-badge";
import {
 downloadIcs,
 formatInterviewDate,
 formatInterviewTime,
 interviewTypeLabel,
} from "./format";
import {
 InterviewStatus,
 type InterviewData,
} from "@/types/api/interviews";

function interviewTitle(interview: InterviewData): string {
 return (
 interview.job?.title ??
 (interview.candidate
 ? `${interview.candidate.firstName} ${interview.candidate.lastName}`
 : "Interview")
 );
}

export function toDateQuery(iso: string): string {
 const date = new Date(iso);
 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, "0");
 const day = String(date.getDate()).padStart(2, "0");
 return `${year}-${month}-${day}`;
}

export function calendarHref(iso: string): string {
 return `/interviews/calendar?date=${toDateQuery(iso)}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date: Date): Date {
 return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateQuery(value: string): Date | undefined {
 const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
 if (!match) return undefined;
 return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function MonthCalendar({
 interviews,
 focusDate,
}: {
 interviews: InterviewData[];
 focusDate?: string;
}) {
 const today = startOfDay(new Date());
 const focus = focusDate ? parseDateQuery(focusDate) : undefined;
 const [cursor, setCursor] = useState(() => {
 const base = focus ?? today;
 return new Date(base.getFullYear(), base.getMonth(), 1);
 });

 const cells = useMemo(() => {
 const year = cursor.getFullYear();
 const month = cursor.getMonth();
 const firstWeekday = new Date(year, month, 1).getDay();
 const daysInMonth = new Date(year, month + 1, 0).getDate();

 const byDay = new Map<number, InterviewData[]>();
 for (const interview of interviews) {
 const date = new Date(interview.scheduledAt);
 if (
 date.getFullYear() === year &&
 date.getMonth() === month
 ) {
 const list = byDay.get(date.getDate()) ?? [];
 list.push(interview);
 byDay.set(date.getDate(), list);
 }
 }

 const cells: {
 date: Date;
 interviews: InterviewData[];
 outside: boolean;
 }[] = [];
 for (let i = 0; i < firstWeekday; i++) {
 cells.push({
 date: new Date(year, month, 1 - (firstWeekday - i)),
 interviews: [],
 outside: true,
 });
 }
 for (let day = 1; day <= daysInMonth; day++) {
 cells.push({
 date: new Date(year, month, day),
 interviews: byDay.get(day) ?? [],
 outside: false,
 });
 }
 while (cells.length % 7 !== 0) {
 const last = cells[cells.length - 1].date;
 cells.push({
 date: new Date(
 last.getFullYear(),
 last.getMonth(),
 last.getDate() + 1
 ),
 interviews: [],
 outside: true,
 });
 }
 return cells;
 }, [interviews, cursor]);

 const monthLabel = cursor.toLocaleString(undefined, {
 month: "long",
 year: "numeric",
 });

 return (
 <div className=" border border-border/15 p-4">
 <div className="mb-4 flex items-center justify-between gap-2">
 <div className="flex items-center gap-1.5">
 <Button
 variant="outline"
 size="icon"
 onClick={() =>
 setCursor(
 new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
 )
 }
 aria-label="Previous month"
 >
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <Button
 variant="outline"
 size="icon"
 onClick={() =>
 setCursor(
 new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
 )
 }
 aria-label="Next month"
 >
 <ChevronRight className="h-4 w-4" />
 </Button>
 <h2 className="ml-1 text-sm font-semibold">{monthLabel}</h2>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
 >
 Today
 </Button>
 </div>

 <div className="grid grid-cols-7 gap-px overflow-hidden border border-border/15 bg-border/60 text-center">
 {WEEKDAYS.map((weekday) => (
 <div
 key={weekday}
 className="bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground"
 >
 {weekday}
 </div>
 ))}
 {cells.map((cell, index) => {
 const isToday = cell.date.getTime() === today.getTime();
 const isFocus = focus
 ? cell.date.getTime() === focus.getTime()
 : false;
 return (
 <div
 key={index}
 className={`min-h-24 bg-background p-1.5 text-left align-top ${
 cell.outside ? "opacity-40" : ""
 } ${isFocus ? "bg-primary/5 ring-1 ring-inset ring-primary/40" : ""}`}
 >
 <span
 className={`inline-flex size-6 items-center justify-center text-xs ${
 isToday
 ? "bg-primary font-semibold text-primary-foreground"
 : isFocus
 ? "bg-primary/20 font-semibold text-primary"
 : "text-muted-foreground"
 }`}
 >
 {cell.date.getDate()}
 </span>
 <div className="mt-1 space-y-1">
 {cell.interviews.slice(0, 3).map((interview) => (
 <Link
 key={interview.id}
 href={`/interviews/${interview.id}`}
 className="block truncate bg-muted px-1.5 py-0.5 text-[11px] leading-4 text-foreground hover:bg-primary/10 hover:text-primary"
 >
 {formatInterviewTime(
 interview.scheduledAt,
 interview.timezone
 )}{" "}
 {interviewTitle(interview)}
 </Link>
 ))}
 {cell.interviews.length > 3 && (
 <span className="block px-1.5 text-[11px] text-muted-foreground">
 +{cell.interviews.length - 3} more
 </span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

export function CalendarItem({
 interview,
 href,
}: {
 interview: InterviewData;
 href?: string;
}) {
 const calendar = interview.calendar;
 const title = interviewTitle(interview);

 return (
 <div className="flex flex-wrap items-center justify-between gap-3 border border-border/15 p-4">
 <div className="min-w-0">
 <Link
 href={href ?? `/interviews/${interview.id}`}
 className="block truncate text-sm font-medium transition-colors hover:text-primary hover:underline"
 >
 {title}
 </Link>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {formatInterviewDate(interview.scheduledAt, interview.timezone)} ·{" "}
 {interview.durationMinutes} min · {interviewTypeLabel(interview.type)}
 </p>
 </div>
 <div className="flex shrink-0 items-center gap-2">
 <InterviewStatusBadge status={interview.status} />
 {calendar && (
 <>
 <Button asChild size="sm" variant="outline">
 <a href={calendar.googleUrl} target="_blank" rel="noopener noreferrer">
 <Globe className="h-4 w-4" />
 Google
 </a>
 </Button>
 <Button asChild size="sm" variant="outline">
 <a
 href={calendar.outlookUrl}
 target="_blank"
 rel="noopener noreferrer"
 >
 <CalendarDays className="h-4 w-4" />
 Outlook
 </a>
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => downloadIcs(calendar.ics, `interview-${interview.id}.ics`)}
 >
 <Download className="h-4 w-4" />
 .ics
 </Button>
 </>
 )}
 </div>
 </div>
 );
}

export function InterviewCalendarView() {
 usePageTitle("Interview Calendar");
 const searchParams = useSearchParams();
 const [status, setStatus] = useState<InterviewStatus | "all">(
 InterviewStatus.SCHEDULED
 );

 const { data, isLoading, isError, error } = useInterviewCalendar({
 status: status === "all" ? undefined : status,
 limit: 50,
 });

 const interviews = data?.interviews ?? [];
 const focusDate = searchParams.get("date") ?? undefined;

 return (
 <AnimatedContent className="mx-auto max-w-4xl space-y-6">
 <PageHeader
 title="Interview calendar"
 description="Upcoming interviews by month."
 backHref="/interviews"
 actions={
 <>
 <Button asChild variant="outline" size="sm">
 <Link href="/interviews/calendar/list">
 <List className="h-4 w-4" />
 View list
 </Link>
 </Button>
 {data?.ics && interviews.length > 0 ? (
 <Button
 variant="outline"
 size="sm"
 onClick={() => downloadIcs(data.ics, "worker-interviews.ics")}
 >
 <Download className="h-4 w-4" />
 Download all (.ics)
 </Button>
 ) : undefined}
 </>
 }
 />

 <div className="flex flex-wrap gap-1.5">
 {[
 { value: InterviewStatus.SCHEDULED, label: "Scheduled" },
 { value: "all", label: "All" },
 ].map((tab) => (
 <Button
 key={tab.value}
 variant={status === tab.value ? "secondary" : "ghost"}
 size="sm"
 onClick={() => setStatus(tab.value as InterviewStatus | "all")}
 >
 {tab.label}
 </Button>
 ))}
 </div>

 {isError && (
 <ErrorAlert
 message={error instanceof Error ? error.message : "Failed to load calendar"}
 />
 )}

 {isLoading ? (
 <div className="space-y-3">
 {Array.from({ length: 5 }).map((_, i) => (
 <div
 key={i}
 className="h-20 animate-pulse border border-border/15 bg-muted"
 />
 ))}
 </div>
 ) : (
 <>
 <MonthCalendar interviews={interviews} focusDate={focusDate} />
 {interviews.length === 0 && (
 <div className=" border border-border/15">
 <EmptyState
 icon={CalendarDays}
 title="No interviews on your calendar"
 description="Scheduled interviews with calendar links will show up here."
 />
 </div>
 )}
 </>
 )}
 </AnimatedContent>
 );
}
