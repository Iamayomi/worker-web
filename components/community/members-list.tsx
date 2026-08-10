"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import { useCommunityMembers } from "@/lib/hooks/use-community";
import {
  CommunityRole,
  type CommunityMemberData,
} from "@/types/api/community";

const ROLE_LABELS: Record<CommunityRole, string> = {
  [CommunityRole.MEMBER]: "Member",
  [CommunityRole.MODERATOR]: "Moderator",
  [CommunityRole.ADMIN]: "Admin",
};

export function MembersList({ communityId }: { communityId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCommunityMembers(communityId, {
    page,
    limit: 20,
  });

  const members = data?.members ?? [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/60" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members yet"
        description="Members who join this community will appear here"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {members.map((member: CommunityMemberData) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9">
                {member.avatarUrl ? (
                  <AvatarImage src={member.avatarUrl} alt={member.name ?? ""} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {(member.name ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.name ?? "Member"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Joined{" "}
                  {new Date(member.joinedAt).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Badge
              variant={
                member.role === CommunityRole.ADMIN ? "default" : "secondary"
              }
            >
              {ROLE_LABELS[member.role]}
            </Badge>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
