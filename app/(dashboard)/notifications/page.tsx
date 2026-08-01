"use client";

import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from "@/lib/hooks/use-notifications";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorAlert } from "@/components/shared/error-alert";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AnimatedContent } from "@/components/shared/animated-content";

function NotificationItem({ n }: { n: any }) {
  const markRead = useMarkRead(n.id);

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border p-4 transition-colors ${
        !n.read ? "border-l-2 border-l-primary bg-primary/[0.02] border-border/15" : "border-border/10"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${!n.read ? "font-semibold" : "text-muted-foreground"}`}>{n.title}</p>
        {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!n.read && (
          <Button variant="ghost" size="icon-sm" onClick={() => markRead.mutate()}>
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        )}
        {n.link && (
          <Link href={n.link} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
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
  const list = (items as any[]) || [];
  const count = (unreadCount as number) || 0;

  if (isLoading) return <LoadingSpinner />;

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
        {list.map((n: any) => (
            <NotificationItem n={n} />
        ))}
      </div>
    </AnimatedContent>
  );
}

