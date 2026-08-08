"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Settings,
  LogOut,
  Bell,
  ShieldAlert,
  ShieldCheck,
  PanelLeft,
  X,
  Briefcase,
  FileText,
  LayoutDashboard,
  Gift,
  UserPlus,
  PlusCircle,
  Users,
  Settings2,
  BadgeCheck,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DashboardHeaderSkeleton } from "@/components/shared/skeletons";
import { AccountType, UserRole } from "@/types/api/auth";
import { TalentHeader, UserMenu } from "@/components/layout/talent-header";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useClientProfile } from "@/lib/hooks/use-profiles";

type NavLinkItem = { href: string; label: string; icon: LucideIcon };
type NavSection = { title: string; links: NavLinkItem[] };

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
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isClient = user?.accountType === AccountType.CLIENT && !isAdmin;
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  const sections: NavSection[] = [
    {
      title: isTalent ? "Home" : "Dashboard",
      links: [
        {
          href: isTalent ? "/home" : "/dashboard",
          label: isTalent ? "Home" : "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
  ];

  if (isAdmin) {
    sections.push({
      title: "Management",
      links: [
        { href: "/admin", label: "User management", icon: Users },
        { href: "/jobs/manage", label: "Job management", icon: Briefcase },
        { href: "/applications/manage", label: "Applications", icon: FileText },
        { href: "/admin/content", label: "Content management", icon: Settings2 },
      ],
    });
    sections.push({
      title: "Notifications",
      links: [
        { href: "/admin/notifications", label: "Notifications", icon: Bell },
      ],
    });
  } else if (isClient) {
    sections.push({
      title: "Jobs",
      links: [
        { href: "/jobs/mine", label: "My jobs", icon: Briefcase },
        { href: "/dashboard/jobs/new", label: "Post a job", icon: PlusCircle },
      ],
    });
  } else {
    sections.push({
      title: "Jobs",
      links: [
        { href: "/jobs", label: "Browse jobs", icon: Briefcase },
        { href: "/applications", label: "My applications", icon: FileText },
      ],
    });
  }

  sections.push({
    title: "Referral",
    links: [{ href: "/referral", label: "Referral", icon: Gift }],
  });

  if (isAdmin) {
    sections.push({
      title: "Trust & safety",
      links: [
        { href: "/admin/reports", label: "Trust & safety", icon: ShieldCheck },
      ],
    });
  }

  sections.push({
    title: "Account",
    links: [
      ...(isAdmin || isClient
        ? [{ href: "/invite", label: "Invite team", icon: UserPlus }]
        : []),
      { href: "/profile", label: "Profile", icon: UserRound },
      { href: "/sessions", label: "Sessions", icon: ShieldAlert },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  });

  const linkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  return (
    <>
      {sections.map((section, index) => (
        <div key={section.title}>
          <div
            className={
              index === 0
                ? "mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                : "mb-2 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            }
          >
            {section.title}
          </div>
          {section.links.map((link) => (
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
        </div>
      ))}
    </>
  );
}

function SidebarLogo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className="flex h-16 items-center gap-2 border-b border-border/15 px-6 hover:opacity-80"
    >
      <span className="text-lg font-bold tracking-tight">Worker</span>
    </Link>
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, accessToken, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const needsAuth = true;
  const pendingAuth = isLoading || (accessToken && !isAuthenticated);

  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;
  const isClient = user?.accountType === AccountType.CLIENT && !isAdmin;
  const { data: clientProfile } = useClientProfile(isClient);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !accessToken) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, accessToken, router]);

  if (pendingAuth) {
    return <DashboardHeaderSkeleton />;
  }

  if (!isAuthenticated && needsAuth) return null;

  if (isTalent) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <TalentHeader pathname={pathname} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 flex-col border-r border-border/15 bg-background lg:flex">
        <SidebarLogo />
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
            <SidebarLogo onNavigate={() => setMenuOpen(false)} />
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
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              {isClient ? (
                <>
                  <span className="truncate">
                    {clientProfile?.companyName ?? "Dashboard"}
                  </span>
                  {clientProfile?.verificationStatus === "verified" && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </>
              ) : (
                "Dashboard"
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
