"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ContentSubNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/content", label: "Content" },
    { href: "/admin/pages", label: "Landing pages" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            pathname === tab.href || pathname.startsWith(tab.href + "/")
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
