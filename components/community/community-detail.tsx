"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/community/post-card";
import { EventCard } from "@/components/community/event-card";
import { MembersList } from "@/components/community/members-list";
import { JoinButton } from "@/components/community/join-button";
import { CreatePostDialog } from "@/components/community/create-post-dialog";
import { CreateEventDialog } from "@/components/community/create-event-dialog";
import { useCommunity, useCommunityPosts, useCommunityEvents } from "@/lib/hooks/use-community";
import { useAuthStore } from "@/store/authStore";
import {
  CommunityVisibility,
  CommunityRole,
  CommunityStatus,
  type CommunityPostData,
  type CommunityEventData,
} from "@/types/api/community";

interface CommunityDetailProps {
  communityId: string;
}

export function CommunityDetail({ communityId }: CommunityDetailProps) {
  const [postPage, setPostPage] = useState(1);
  const user = useAuthStore((s) => s.user);

  const { data: community, isLoading, error } = useCommunity(communityId);
  const { data: postsData, isLoading: postsLoading } = useCommunityPosts(communityId, {
    page: postPage,
    limit: 10,
  });
  const { data: eventsData, isLoading: eventsLoading } = useCommunityEvents(communityId, {
    limit: 10,
    upcoming: true,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold">Community not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ?? "This community may have been removed."}
        </p>
        <Link
          href="/community"
          className="mt-6 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to communities
        </Link>
      </div>
    );
  }

  const isMember = !!community.isMember;
  const userRole = community.role;
  const canPost = isMember;
  const isOwnerOrAdmin =
    community.ownerId === user?.id ||
    userRole === CommunityRole.ADMIN ||
    userRole === CommunityRole.MODERATOR;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All communities
      </Link>

      <div className="mt-4 overflow-hidden rounded-xl border bg-card">
        {community.coverImage ? (
          <div className="relative h-48 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={community.coverImage}
              alt={community.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary" />
        )}
        <div className="space-y-4 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {community.name}
                </h1>
                {community.visibility === CommunityVisibility.PRIVATE && (
                  <Badge variant="secondary">
                    <Lock className="size-3" /> Private
                  </Badge>
                )}
                {community.status !== CommunityStatus.ACTIVE && (
                  <Badge variant="destructive">{community.status}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {community.description || "No description yet"}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-4" />
                {community.memberCount.toLocaleString()}{" "}
                {community.memberCount === 1 ? "member" : "members"}
              </p>
            </div>
            {user && <JoinButton communityId={communityId} isMember={isMember} />}
          </div>

          <Tabs defaultValue="posts" className="mt-2">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Latest discussions
                </h2>
                {canPost && <CreatePostDialog communityId={communityId} />}
              </div>

              {postsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (postsData?.posts?.length ?? 0) === 0 ? (
                <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                  No posts yet{canPost ? " — start the conversation!" : "."}
                </p>
              ) : (
                (postsData?.posts ?? []).map((post: CommunityPostData) => (
                  <PostCard
                    key={post.id}
                    communityId={communityId}
                    post={post}
                    currentUserId={user?.id}
                    isMember={isMember}
                    userRole={userRole}
                  />
                ))
              )}

              {postsData && postsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Page {postsData.pagination.page} of{" "}
                    {postsData.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                      disabled={postPage <= 1}
                      onClick={() => setPostPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                      disabled={!postsData.pagination.hasNext}
                      onClick={() => setPostPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Upcoming events
                </h2>
                {isMember && <CreateEventDialog communityId={communityId} />}
              </div>

              {eventsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 w-full" />
                  ))}
                </div>
              ) : (eventsData?.events?.length ?? 0) === 0 ? (
                <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                  No upcoming events{isMember ? " — host the first one!" : "."}
                </p>
              ) : (
                (eventsData?.events ?? []).map((event: CommunityEventData) => (
                  <EventCard
                    key={event.id}
                    communityId={communityId}
                    event={event}
                    currentUserId={user?.id}
                    canManage={isOwnerOrAdmin || event.organizerId === user?.id}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="members" className="pt-4">
              <MembersList communityId={communityId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
