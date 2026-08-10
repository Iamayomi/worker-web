"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { Search, Users, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "@/components/community/community-card";
import { CreateCommunityDialog } from "@/components/community/create-community-dialog";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useCommunities } from "@/lib/hooks/use-community";
import { useAuthStore } from "@/store/authStore";
import type { CommunityData } from "@/types/api/community";

const PAGE_SIZE = 12;

export function CommunityDirectory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, error } = useCommunities({
    page,
    limit: PAGE_SIZE,
    search: deferredSearch || undefined,
  });

  const communities = data?.communities ?? [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Community
            </h1>
            <p className="mt-2 text-muted-foreground">
              Join a global network of professionals. Connect with peers across
              every industry, share insights, and grow together.
            </p>
          </div>
          {user && <CreateCommunityDialog />}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search communities…"
            className="pl-9"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-xl border bg-muted/40"
              />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <EmptyState
            icon={deferredSearch ? Search : Users}
            title={deferredSearch ? "No communities found" : "No communities yet"}
            description={
              deferredSearch
                ? `Nothing matches "${deferredSearch}". Try a different search.`
                : "Be the first to start a community."
            }
            action={
              user ? (
                <CreateCommunityDialog />
              ) : (
                <Button asChild>
                  <Link href="/register">
                    <UserPlus className="size-4" /> Join Worker
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((community: CommunityData) => (
                <CommunityCard key={community.id} community={community} />
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
          </>
        )}
      </div>
    </div>
  );
}
