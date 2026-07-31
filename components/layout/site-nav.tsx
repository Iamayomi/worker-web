"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { navItems, profile } from "@/lib/fallbacks/portfolio-data";
import Image from "next/image";

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function SiteNav() {
  const pathname = usePathname();
  const activeItem = navItems.find((item) => isActivePath(pathname, item.href));

  return (
    <header className="sticky top-0 z-40 border-b border-border/15 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="group inline-flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center border-2 border-border/30 bg-accent text-accent-foreground transition-transform group-hover:-rotate-6 overflow-hidden rounded-2xl">
            {/* <Cookie className="h-4 w-4" /> */}
            <Image
              alt="Logo avatar"
              src={"/avatar.png"}
              height={200}
              width={200}
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block  font-black capitalize text-2xl tracking-[0.16em] leading-none font-sketch relative">
              {/* <TiPin className="absolute -right-2 -top-1 h-5 w-5 rotate-12 fill-red-500 text-red-500" /> */}
              {profile.handle}
            </span>
            <span className="block truncate text-[0.5rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {activeItem?.code
                ? activeItem.code === "articles"
                  ? "My"
                  : activeItem.code
                : "home"}{" "}
              note
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-none border border-transparent px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-border/40 hover:bg-secondary/50",
                  isActive && "text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
