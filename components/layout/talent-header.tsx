"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronDown,
  Gift,
  LogOut,
  Moon,
  PanelLeft,
  Settings,
  ShieldAlert,
  Sun,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useTalentProfile } from "@/lib/hooks/use-profiles";
import { useTheme } from "next-themes";
import { AccountType, UserRole } from "@/types/api/auth";
import { ROLE_LABELS } from "@/lib/constants/enums";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function UserMenu({ showAccountLinks = false }: { showAccountLinks?: boolean }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: talentProfile } = useTalentProfile(showAccountLinks);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";
  const roles = ((user?.roles ?? []) as UserRole[]).filter(
    (role) => role !== UserRole.USER
  );
  const roleLabel =
    roles.length > 0
      ? roles.map((role) => ROLE_LABELS[role] ?? role).join(", ")
      : user?.accountType ?? "";
  const fullName = talentProfile
    ? [talentProfile.firstName, talentProfile.lastName]
        .filter(Boolean)
        .join(" ")
    : "";
  const accountType = user?.accountType;
  const isClient = accountType === AccountType.CLIENT;
  const isTalent = accountType === AccountType.TALENT;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border p-0.5 pr-3 transition-colors"
        >
          <Avatar className="size-8">
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
            {fullName || user?.email}
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {fullName && <p className="truncate font-medium">{fullName}</p>}
          <p className="truncate capitalize">{roleLabel}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(isClient || isTalent) && (
          <DropdownMenuItem
            onSelect={() =>
              router.push(isClient ? "/client-profile" : "/profile")
            }
            className="cursor-pointer"
          >
            {isClient ? <Building2 /> : <User />}
            {isClient ? "Company profile" : "Profile"}
          </DropdownMenuItem>
        )}
        {showAccountLinks && (
          <>
            <DropdownMenuItem
              onSelect={() => router.push("/dashboard/referral")}
              className="cursor-pointer"
            >
              <Gift />
              Referral
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => router.push("/sessions")}
              className="cursor-pointer"
            >
              <ShieldAlert />
              Sessions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onSelect={() => router.push("/settings")}
          className="cursor-pointer"
        >
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="cursor-pointer"
        >
          <Moon className="h-4 w-4 dark:hidden" />
          <Sun className="hidden h-4 w-4 dark:block" />
          {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => logout()}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const talentLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/saved-jobs", label: "Saved jobs" },
];

function TalentHeader({ pathname }: { pathname: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/15 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </button>
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight sm:text-xl"
          >
            Worker
          </Link>
        </div>
        <nav className="hidden items-center gap-1 lg:flex">
          {talentLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <UserMenu showAccountLinks />
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-b border-border/15 p-4 lg:hidden">
          {talentLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

export { TalentHeader, UserMenu };
