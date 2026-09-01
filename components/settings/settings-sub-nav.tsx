"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
 { href: "/settings/notifications", label: "Notifications" },
 { href: "/settings/blocked", label: "Blocked users" },
];

export function SettingsSubNav() {
 const pathname = usePathname();
 const isActive = (href: string) =>
 href === "/settings"
 ? pathname === "/settings"
 : pathname.startsWith(href);

 return (
 <div className="flex flex-wrap gap-1.5">
 {tabs.map((tab) => (
 <Link
 key={tab.href}
 href={tab.href}
 className={cn(
 " px-3 py-1.5 text-sm font-medium transition-colors",
 isActive(tab.href)
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
