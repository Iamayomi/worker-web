"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Boxes, NotebookText, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Profile", icon: Home },
  { href: "/experience", label: "Work", icon: Briefcase },
  { href: "/builds", label: "Builds", icon: Boxes },
  { href: "/notes", label: "Notes", icon: NotebookText },
  { href: "/contact", label: "Resume", icon: FileText },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border/15 bg-background/95 backdrop-blur-sm lg:hidden"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = isActivePath(pathname, tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-wider transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive && "fill-primary/15"
                )}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
