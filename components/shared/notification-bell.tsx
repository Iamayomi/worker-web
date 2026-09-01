"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "@/lib/hooks/use-notifications";
import type { NotificationData } from "@/lib/types/api";
import { UnreadDot } from "@/components/shared/unread-dot";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function NotificationItem({ n }: { n: NotificationData }) {
  const markRead = useMarkRead(n.id);
  const isUnread = n.status !== "read";
  const link = (n.metadata as { link?: string } | null)?.link;

  return (
    <div className="flex items-start justify-between gap-2 border-b px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${isUnread ? "font-semibold" : "text-muted-foreground"}`}>
          {n.title}
        </p>
        {n.message && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isUnread && (
          <button
            onClick={() => markRead.mutate()}
            aria-label="Mark as read"
            className="p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        {link && (
          <a
            href={link}
            onClick={() => markRead.mutate()}
            className="p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Open notification"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export function NotificationBell() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: unread } = useUnreadCount();
  const { data: items, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  const unreadCount = unread ?? 0;
  const list = (items as NotificationData[]) ?? [];

  if (pathname.startsWith("/notifications")) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <UnreadDot show={unreadCount > 0} className="-right-0.5 -top-0.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            list.slice(0, 8).map((n: NotificationData) => (
              <NotificationItem key={n.id} n={n} />
            ))
          )}
        </div>

        <button
          onClick={() => router.push("/notifications")}
          className="w-full border-t px-4 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-muted"
        >
          View all notifications
        </button>
      </PopoverContent>
    </Popover>
  );
}
