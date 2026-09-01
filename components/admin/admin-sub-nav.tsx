"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
 id: string;
 href: string;
 label: string;
}

const tabs: Tab[] = [
 { id: "users", href: "/admin", label: "Users" },
 { id: "clients", href: "/admin/clients", label: "Client / Company" },
 { id: "talent", href: "/admin/talent", label: "Talent" },
 { id: "invites", href: "/admin/invites", label: "Invites" },
];

export function AdminSubNav({ active }: { active?: string }) {
 const pathname = usePathname();
 const resolved =
 active ??
 (pathname.startsWith("/admin/invites")
 ? "invites"
 : pathname.startsWith("/admin/clients")
 ? "clients"
 : pathname.startsWith("/admin/talent")
 ? "talent"
 : "users");

 return (
 <div className="flex flex-wrap gap-1.5">
 {tabs.map((tab) => (
 <Link
 key={tab.id}
 href={tab.href}
 className={cn(
 " px-3 py-1.5 text-sm font-medium transition-colors",
 resolved === tab.id
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
