"use client";

import { ScheduleInterviewForm } from "@/components/interviews/schedule-interview-form";
import { AnimatedContent } from "@/components/shared/animated-content";

export default function NewInterviewPage() {
  return (
    <AnimatedContent className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule interview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a job, an application, a time and the candidates to invite.
        </p>
      </div>
      <div className="rounded-xl border border-border/15 p-5">
        <ScheduleInterviewForm />
      </div>
    </AnimatedContent>
  );
}
