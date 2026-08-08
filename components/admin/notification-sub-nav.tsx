"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "all", label: "All notifications", href: "/admin/notifications" },
  { value: "send", label: "Send", href: "/admin/notifications/send" },
] as const;

export function NotificationSubNav() {
  const pathname = usePathname();
  const active = pathname.startsWith("/admin/notifications/send")
    ? "send"
    : "all";

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border/15 pb-3">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            active === tab.value
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
