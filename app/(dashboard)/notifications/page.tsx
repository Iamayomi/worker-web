"use client";

import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from "@/lib/hooks/use-notifications";
import type { NotificationData } from "@/lib/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/error-alert";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AnimatedContent } from "@/components/shared/animated-content";

function NotificationItem({ n }: { n: NotificationData }) {
  const markRead = useMarkRead(n.id);
  const isUnread = n.status !== "read";
  const link = (n.metadata as { link?: string } | null)?.link;

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border p-4 transition-colors ${
        isUnread ? "border-l-2 border-l-primary bg-primary/[0.02] border-border/15" : "border-border/10"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${isUnread ? "font-semibold" : "text-muted-foreground"}`}>{n.title}</p>
        {n.message && <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isUnread && (
          <Button variant="ghost" size="icon-sm" onClick={() => markRead.mutate()}>
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        )}
        {link && (
          <Link href={link} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data: items, isLoading, error } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAllRead = useMarkAllRead();
  const list = (items as NotificationData[]) || [];
  const count = (unreadCount as number) || 0;

  if (isLoading)
    return (
      <AnimatedContent className="mx-auto max-w-2xl space-y-6">
        <SectionSkeleton />
      </AnimatedContent>
    );

  return (
    <AnimatedContent className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Notifications"
        description={count > 0 ? `${count} unread` : undefined}
        actions={
          count > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )
        }
      />

      {error && <ErrorAlert message={error.message} />}

      <div className="space-y-1">
        {list.length === 0 && (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up" />
        )}
        {list.map((n: NotificationData) => (
            <NotificationItem key={n.id} n={n} />
        ))}
      </div>
    </AnimatedContent>
  );
}

