"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  LogOut,
  Bell,
  ShieldAlert,
  PanelLeft,
  X,
  ChevronDown,
  UserPlus,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInviteableRoles } from "@/lib/constants/enums";
import { UserRole } from "@/types/api/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const utilityLinks = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/sessions", label: "Sessions", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  const isActive = (path: string) => pathname.startsWith(path);
  const myRoles = (user?.roles ?? []) as UserRole[];
  const canInvite = getInviteableRoles(myRoles).length > 0;
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);

  const managementLinks = [
    ...(canInvite ? [{ href: "/invite", label: "Invite user", icon: UserPlus }] : []),
    { href: "/invitees", label: "My invitees", icon: Users },
    ...(isAdmin ? [{ href: "/admin", label: "User management", icon: ShieldCheck }] : []),
  ];

  const linkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  return (
    <>
      <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Management</div>
      {managementLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={linkClass(link.href)}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
      <div className="mb-2 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</div>
      {utilityLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={linkClass(link.href)}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </>
  );
}

function SidebarFooter({
  userEmail,
  logout,
}: {
  userEmail?: string;
  logout: () => void;
}) {
  return (
    <div className="border-t border-border/15 p-4">
      <div className="mb-2 px-3 text-xs text-muted-foreground">
        {userEmail}
      </div>
      <div className="mb-2 flex items-center justify-between px-3">
        <span className="text-xs text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
      <button
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

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
            {user?.email}
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate">{user?.accountType}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => router.push("/settings")}
          className="cursor-pointer"
        >
          <Settings />
          Settings
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, accessToken, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const needsAuth = true;
  const pendingAuth = isLoading || (accessToken && !isAuthenticated);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !accessToken) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, accessToken, router]);

  if (pendingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated && needsAuth) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 flex-col border-r border-border/15 bg-background lg:flex">
        <Link href="/" className="flex h-16 items-center border-b border-border/15 px-6 hover:opacity-80">
          <span className="text-lg font-bold tracking-tight">Worker</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLinks pathname={pathname} />
        </nav>
        <SidebarFooter userEmail={user?.email} logout={logout} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border/15 bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex h-16 items-center border-b border-border/15 px-6 hover:opacity-80">
              <span className="text-lg font-bold tracking-tight">Worker</span>
            </Link>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </nav>
            <SidebarFooter
              userEmail={user?.email}
              logout={() => {
                setMenuOpen(false);
                logout();
              }}
            />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border/15 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
