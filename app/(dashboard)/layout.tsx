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
 ChevronsLeft,
 ChevronsRight,
 X,
 Briefcase,
 FileText,
 LayoutDashboard,
  Gift,
  Users,
 BadgeCheck,
 UserRound,
 Activity,
 Newspaper,
  LayoutTemplate,
  CalendarDays,
  CreditCard,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DashboardHeaderSkeleton, TalentHomeSkeleton } from "@/components/shared/skeletons";
import { AccountType, UserRole } from "@/types/api/auth";
import { TalentHeader, UserMenu } from "@/components/layout/talent-header";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useClientProfile } from "@/lib/hooks/use-profiles";

type NavLinkItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
type NavSection = { title: string; links: NavLinkItem[] };

function NavLinks({
 pathname,
 onNavigate,
 collapsed = false,
}: {
 pathname: string;
 onNavigate?: () => void;
 collapsed?: boolean;
}) {
 const { user } = useAuth();
 const matchActive = (link: { href: string; exact?: boolean }) =>
 link.exact
 ? pathname === link.href
 : pathname === link.href || pathname.startsWith(link.href + "/");
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
 { href: "/admin", label: "User management", icon: Users, exact: true },
 { href: "/jobs/manage", label: "Job management", icon: Briefcase },
 {
 href: "/applications/manage",
 label: "Applications",
 icon: FileText,
 },
 { href: "/admin/interviews", label: "Interviews", icon: CalendarDays },
 {
 href: "/admin/email-templates",
 label: "Email templates",
 icon: Mail,
 },
 ],
 });
 sections.push({
 title: "Content",
 links: [
 { href: "/admin/content", label: "Content", icon: Newspaper },
 {
 href: "/admin/pages",
 label: "Landing pages",
 icon: LayoutTemplate,
 },
 ],
 });
 sections.push({
 title: "Notifications",
 links: [
 {
 href: "/admin/notifications",
 label: "Notifications",
 icon: Bell,
 exact: true,
 },
 ],
 });
  } else if (isClient) {
    sections.push({
      title: "Jobs",
      links: [
        { href: "/jobs/mine", label: "My jobs", icon: Briefcase },
        { href: "/talent-search", label: "Talent search", icon: Users },
        { href: "/analytics", label: "Analytics", icon: Activity },
      ],
    });  } else {
 sections.push({
 title: "Jobs",
 links: [
 { href: "/jobs", label: "Browse jobs", icon: Briefcase },
 { href: "/applications", label: "My applications", icon: FileText },
 ],
 });
 }

 if (isClient || isTalent) {
  sections.push({
  title: "Interviews",
  links: [
  { href: "/interviews", label: "Interviews", icon: CalendarDays },
  ],
  });
 }

 sections.push({
 title: "Referral",
 links: [{ href: "/referral", label: "Referral", icon: Gift, exact: true }],
 });

 if (isAdmin) {
 sections.push({
 title: "Trust & safety",
 links: [
 { href: "/admin/reports", label: "Trust & safety", icon: ShieldCheck },
 ],
 });
 sections.push({
 title: "Performance",
 links: [{ href: "/admin/performance", label: "Performance", icon: Activity }],
 });
 }

  sections.push({
  title: "Account",
  links: [
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/sessions", label: "Sessions", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings, exact: true },
  ],
  });

  if (!isAdmin) {
  sections[sections.length - 1].links.push({
  href: "/billing",
  label: "Billing",
  icon: CreditCard,
  exact: true,
  });
  }

 const linkClass = (href: string, active: boolean) =>
 collapsed
 ? `flex items-center justify-center p-2 text-sm font-normal transition-colors ${
 active
 ? "bg-primary/10 text-primary"
 : "text-muted-foreground hover:bg-secondary hover:text-foreground"
 }`
  : `flex items-center gap-3 px-3 py-2 text-sm font-normal transition-colors ${
  active
  ? "bg-primary/10 text-primary"
  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
  }`;

 return (
  <>
  {sections.map((section, index) => (
  <div key={section.title}>
  {index === 0 ? null : (
  <div
  className={`${collapsed ? "mx-3" : "mx-4"} mb-2 mt-4 border-t border-border/15`}
  />
  )}
  {(() => {
 const matching = section.links.filter(matchActive);
 const activeHref =
 matching.sort((a, b) => b.href.length - a.href.length)[0]
 ?.href ?? null;
 return section.links.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 onClick={onNavigate}
 title={collapsed ? link.label : undefined}
 className={linkClass(link.href, link.href === activeHref)}
 >
  {!collapsed && link.label}
  {collapsed && <link.icon className="h-4 w-4" />}
  </Link>
 ));
 })()}
 </div>
 ))}
 </>
 );
}

function SidebarLogo({
 onNavigate,
 collapsed = false,
}: {
 onNavigate?: () => void;
 collapsed?: boolean;
}) {
 return (
 <Link
 href="/dashboard"
 onClick={onNavigate}
 className={`flex h-16 items-center border-b border-border/15 hover:opacity-80 ${
 collapsed ? "justify-center px-0" : "gap-2 px-6"
 }`}
 >
 {collapsed ? (
 <span className="flex h-8 w-8 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
 W
 </span>
 ) : (
 <span className="text-lg font-bold tracking-tight">Worker</span>
 )}
 </Link>
 );
}

function SidebarFooter({
 userEmail,
 logout,
 collapsed = false,
}: {
 userEmail?: string;
 logout: () => void;
 collapsed?: boolean;
}) {
 if (collapsed) {
 return (
 <div className="border-t border-border/15 p-2">
 <button
 onClick={logout}
 title="Sign out"
 className="flex w-full items-center justify-center p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
 >
 <LogOut className="h-4 w-4" />
 </button>
 </div>
 );
 }

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
 className="flex w-full items-center gap-3 px-3 py-2 text-sm font-normal text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
 const [collapsed, setCollapsed] = useState(() => {
 if (typeof window === "undefined") return false;
 try {
 return window.localStorage.getItem("sidebar-collapsed") === "1";
 } catch {
 return false;
 }
 });

 useEffect(() => {
 try {
 window.localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
 } catch {
 // ignore storage errors
 }
 }, [collapsed]);

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
 return pathname === "/home" ? <TalentHomeSkeleton /> : <DashboardHeaderSkeleton />;
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
 <aside
 className={`hidden flex-col border-r border-border/15 bg-background transition-[width] duration-200 lg:flex ${
 collapsed ? "lg:w-[4.5rem]" : "lg:w-64"
 }`}
 >
 <SidebarLogo collapsed={collapsed} />
 <nav className={`flex-1 space-y-1 overflow-y-auto ${collapsed ? "p-2" : "p-4"}`}>
 <NavLinks pathname={pathname} collapsed={collapsed} />
 </nav>
 <SidebarFooter userEmail={user?.email} logout={logout} collapsed={collapsed} />
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
 className=" p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
 aria-label="Open menu"
 >
 {menuOpen ? <X className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
 </button>
 <button
 type="button"
 onClick={() => setCollapsed((c) => !c)}
 className="hidden p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:inline-flex"
 aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
 >
 {collapsed ? (
 <ChevronsRight className="h-5 w-5" />
 ) : (
 <ChevronsLeft className="h-5 w-5" />
 )}
 </button>
 <h1 className="flex items-center gap-2 text-lg font-semibold">
 {isClient ? (
 <>
 <span className="truncate">
 {clientProfile?.companyName ?? "Dashboard"}
 </span>
 {clientProfile?.verificationStatus === "verified" && (
 <span className="inline-flex shrink-0 items-center gap-1 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
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
