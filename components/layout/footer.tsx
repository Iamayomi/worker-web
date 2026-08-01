"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const columns = [
  {
    title: "For talent",
    links: [
      { label: "Browse jobs", href: "/#jobs" },
      { label: "Create profile", href: "/register" },
      { label: "Community", href: "/community" },
      { label: "Career advice", href: "/#jobs" },
    ],
  },
  {
    title: "For companies",
    links: [
      { label: "Post a job", href: "/register" },
      { label: "Find talent", href: "/talent" },
      { label: "Pricing", href: "/register" },
      { label: "Recruitment", href: "/talent" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Blog", href: "/" },
      { label: "Press", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-bold tracking-tight">Worker</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The global marketplace connecting talented people with world-class teams.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>Copyright © {new Date().getFullYear()} Worker Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="#" className="transition-colors hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="transition-colors hover:text-foreground">Terms of Use</Link>
              <Link href="#" className="transition-colors hover:text-foreground">Contact</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

