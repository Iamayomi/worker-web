"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, LoaderCircle, PlusCircle, Video } from "lucide-react";
import { useInterviews } from "@/lib/hooks/use-interviews";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";
import {
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
} from "@/lib/constants/enums";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { FormInput } from "@/components/ui/form-input";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Pagination } from "@/components/shared/pagination";
import { InterviewCard } from "./interview-card";
import type {
  InterviewStatus,
  InterviewType,
} from "@/types/api/interviews";

const PAGE_SIZE = 10;

export function InterviewsPage() {
  const { user } = useAuth();
  usePageTitle("Interviews");

  const [status, setStatus] = useState<InterviewStatus | "">("");
  const [type, setType] = useState<InterviewType | "">("");
  const [page, setPage] = useState(1);
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyName, setCompanyName] = useState("");

  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) ||
    myRoles.includes(UserRole.ADMIN) ||
    user?.accountType === AccountType.ADMIN;
  const isClient = user?.accountType === "client";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCompanyName(companyQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [companyQuery]);

  const { data, isLoading, isError, error } = useInterviews({
    status: status || undefined,
    type: type || undefined,
    companyName: isAdmin && companyName ? companyName : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const interviews = data?.interviews ?? [];

  return (
    <AnimatedContent className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Interviews"
        description={
          isAdmin
            ? "All interviews across companies."
            : isClient
              ? "Manage interviews for your open roles."
              : "Your upcoming and past interviews."
        }
        actions={
          !isAdmin ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/interviews/calendar">
                  <CalendarDays className="h-4 w-4" />
                  Calendar
                </Link>
              </Button>
              {isClient && (
                <Button asChild size="sm">
                  <Link href="/interviews/new">
                    <PlusCircle className="h-4 w-4" />
                    New interview
                  </Link>
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={status === "" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setStatus("");
              setPage(1);
            }}
          >
            All
          </Button>
          {INTERVIEW_STATUSES.map((s) => (
            <Button
              key={s.value}
              variant={status === s.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setStatus(s.value as InterviewStatus);
                setPage(1);
              }}
            >
              {s.label}
            </Button>
          ))}
        </div>
        <FormSelect
          value={type}
          placeholder="All types"
          onValueChange={(value) => {
            setType(value as InterviewType | "");
            setPage(1);
          }}
          options={[
            { value: "", label: "All types" },
            ...INTERVIEW_TYPES.map((t) => ({ value: t.value, label: t.label })),
          ]}
          className="w-48"
        />
        {isAdmin && (
          <FormInput
            value={companyQuery}
            onChange={(e) => setCompanyQuery(e.target.value)}
            placeholder="Filter by company"
            className="w-56"
          />
        )}
      </div>

      {isError && (
        <ErrorAlert
          message={error instanceof Error ? error.message : "Failed to load interviews"}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-border/15 bg-muted"
            />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="rounded-lg border border-border/15">
          <EmptyState
            icon={Video}
            title="No interviews found"
            description={
              isAdmin
                ? "No interviews match the current filters."
                : isClient
                  ? "Schedule an interview when an application is ready to move forward."
                  : "Interview invitations and scheduled calls will appear here."
            }
            action={
              isClient ? (
                <Button asChild>
                  <Link href="/interviews/new">
                    <PlusCircle className="h-4 w-4" />
                    Schedule an interview
                  </Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}

      {data?.pagination && data.pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}
    </AnimatedContent>
  );
}
