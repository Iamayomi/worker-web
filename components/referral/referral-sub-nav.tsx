"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/types/api/auth";
import { cn } from "@/lib/utils";

export function ReferralSubNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).includes(UserRole.SUPER_ADMIN) ||
      (user?.roles ?? []).includes(UserRole.ADMIN),
    [user]
  );

  const tabs = [
    { href: "/referral", label: "Referral" },
    ...(isAdmin
      ? [{ href: "/referral/manage", label: "Manage" }]
      : []),
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
