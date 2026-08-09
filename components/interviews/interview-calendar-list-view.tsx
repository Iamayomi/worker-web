"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Download } from "lucide-react";
import { useInterviewCalendar } from "@/lib/hooks/use-interviews";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { downloadIcs } from "./format";
import { InterviewStatus } from "@/types/api/interviews";
import { CalendarItem, calendarHref } from "./interview-calendar-view";

export function InterviewCalendarListView() {
  usePageTitle("Interview List");
  const [status, setStatus] = useState<InterviewStatus | "all">(
    InterviewStatus.SCHEDULED
  );

  const { data, isLoading, isError, error } = useInterviewCalendar({
    status: status === "all" ? undefined : status,
    limit: 50,
  });

  const interviews = data?.interviews ?? [];

  return (
    <AnimatedContent className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Interview list"
        description="Upcoming interviews with add-to-calendar links. Click an interview to see it on the calendar."
        backHref="/interviews/calendar"
        actions={
          data?.ics && interviews.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadIcs(data.ics, "worker-interviews.ics")}
            >
              <Download className="h-4 w-4" />
              Download all (.ics)
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
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
        <Button asChild variant="outline" size="sm">
          <Link href="/interviews/calendar">
            <CalendarDays className="h-4 w-4" />
            View calendar
          </Link>
        </Button>
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
              className="h-20 animate-pulse rounded-lg border border-border/15 bg-muted"
            />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={CalendarDays}
            title="No interviews on your calendar"
            description="Scheduled interviews with calendar links will show up here."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {interviews.map((interview) => (
            <CalendarItem
              key={interview.id}
              interview={interview}
              href={calendarHref(interview.scheduledAt)}
            />
          ))}
        </div>
      )}
    </AnimatedContent>
  );
}
