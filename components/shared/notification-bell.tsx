"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/lib/hooks/use-notifications";
import { UnreadDot } from "@/components/shared/unread-dot";

export function NotificationBell() {
  const { data: unread } = useUnreadCount();
  const unreadCount = unread ?? 0;

  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Bell className="h-5 w-5" />
      <UnreadDot show={unreadCount > 0} className="-right-0.5 -top-0.5" />
    </Link>
  );
}
