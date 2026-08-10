"use client";

import Link from "next/link";
import { Users, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CommunityVisibility, type CommunityData } from "@/types/api/community";

interface CommunityCardProps {
  community: CommunityData;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CommunityCard({ community, className }: CommunityCardProps) {
  const isPrivate = community.visibility === CommunityVisibility.PRIVATE;

  return (
    <Link href={`/community/${community.id}`} className={cn("group block", className)}>
      <Card className="h-full gap-0 overflow-hidden p-0 transition-colors group-hover:border-primary/40">
        {community.coverImage ? (
          <div className="relative h-28 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={community.coverImage}
              alt={community.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary">
            <Avatar className="size-12">
              <AvatarFallback className="bg-background/80 text-base font-semibold">
                {initials(community.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        <CardContent className="space-y-2 px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{community.name}</h3>
            {isPrivate && (
              <Badge variant="secondary" className="shrink-0">
                <Lock className="size-3" /> Private
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 min-h-8 text-sm text-muted-foreground">
            {community.description || "No description yet"}
          </p>
          <div className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>
              {community.memberCount.toLocaleString()}{" "}
              {community.memberCount === 1 ? "member" : "members"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
