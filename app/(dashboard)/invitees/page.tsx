"use client";

import { useState } from "react";
import { useInvitees } from "@/lib/hooks/use-users";
import { ROLE_LABELS } from "@/lib/constants/enums";
import type { User, UserRole } from "@/types/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-yellow-500/10 text-yellow-600",
  active: "bg-green-500/10 text-green-600",
  pending_verification: "bg-blue-500/10 text-blue-600",
  suspended: "bg-red-500/10 text-red-600",
  blocked: "bg-red-500/10 text-red-600",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function InviteesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, error } = useInvitees({ page, limit });

  const invitees: User[] = data?.invitees ?? [];
  const pagination = data?.pagination;

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My invitees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People you&apos;ve invited to join the platform.
          </p>
        </div>

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load invitees"}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : invitees.length === 0 ? (
          <div className="rounded-lg border border-border/15">
            <EmptyState
              icon={Users}
              title="No invitees yet"
              description="When you invite someone, they'll show up here."
            />
          </div>
        ) : (
          <div className="space-y-2">
            {invitees.map((invitee) => (
              <div
                key={invitee.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/15 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{invitee.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Invited {formatDate(invitee.invitedAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {invitee.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="text-xs"
                      >
                        {ROLE_LABELS[role as UserRole] ?? role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge className={STATUS_STYLES[invitee.status] ?? undefined}>
                  {invitee.status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevious || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AnimatedContent>
  );
}
