"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronDown, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { cn, getDashboardRoute } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/api/useAuth";
import { useTalentProfile, useClientProfile } from "@/lib/hooks/use-profiles";
import { ROLE_LABELS } from "@/lib/constants/enums";
import { AccountType, UserRole } from "@/types/api/auth";
import { GlobalSearch } from "@/components/layout/global-search";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/shared/notification-bell";

const countries = [
 { code: "US", name: "United States", flag: "🇺🇸", lang: "English", langCode: "en" },
 { code: "GB", name: "United Kingdom", flag: "🇬🇧", lang: "English", langCode: "en" },
 { code: "NG", name: "Nigeria", flag: "🇳🇬", lang: "English", langCode: "en" },
 { code: "ES", name: "Spain", flag: "🇪🇸", lang: "Español", langCode: "es" },
 { code: "MX", name: "Mexico", flag: "🇲🇽", lang: "Español", langCode: "es" },
 { code: "AR", name: "Argentina", flag: "🇦🇷", lang: "Español", langCode: "es" },
 { code: "FR", name: "France", flag: "🇫🇷", lang: "Français", langCode: "fr" },
 { code: "DE", name: "Germany", flag: "🇩🇪", lang: "Deutsch", langCode: "de" },
 { code: "PT", name: "Portugal", flag: "🇵🇹", lang: "Português", langCode: "pt" },
 { code: "BR", name: "Brazil", flag: "🇧🇷", lang: "Português", langCode: "pt" },
 { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", lang: "العربية", langCode: "ar" },
 { code: "EG", name: "Egypt", flag: "🇪🇬", lang: "العربية", langCode: "ar" },
 { code: "IN", name: "India", flag: "🇮🇳", lang: "हिन्दी", langCode: "hi" },
 { code: "JP", name: "Japan", flag: "🇯🇵", lang: "日本語", langCode: "ja" },
 { code: "CN", name: "China", flag: "🇨🇳", lang: "中文", langCode: "zh" },
 { code: "KR", name: "South Korea", flag: "🇰🇷", lang: "한국어", langCode: "ko" },
];

const COUNTRY_KEY = "worker-country";

function detectCountry(): string {
 if (typeof navigator === "undefined") return "US";
 let region = "";
 try {
 region = new Intl.Locale(navigator.language).region ?? "";
 } catch {
 region = "";
 }
 if (region && countries.some((c) => c.code === region)) return region;
 const lang = navigator.language.split("-")[0].toLowerCase();
 const byLang = countries.find((c) => c.langCode === lang);
 return byLang ? byLang.code : "US";
}

function CountrySelect() {
 const [open, setOpen] = useState(false);
 const [current, setCurrent] = useState(countries[0]);
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const saved = localStorage.getItem(COUNTRY_KEY);
 if (saved) {
 const match = countries.find((c) => c.code === saved);
 if (match) {
 setCurrent(match);
 return;
 }
 }
 const match = countries.find((c) => c.code === detectCountry());
 if (match) setCurrent(match);
 }, []);

 function select(country: (typeof countries)[number]) {
 setCurrent(country);
 setOpen(false);
 localStorage.setItem(COUNTRY_KEY, country.code);
 }

 function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
 if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
 }

 return (
 <div ref={ref} onBlur={handleBlur} className="relative">
 <button
 type="button"
 onClick={() => setOpen((o) => !o)}
 aria-label="Select country"
 aria-expanded={open}
 className="inline-flex h-9 items-center gap-1.5 px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
 >
 <span className="text-base leading-none">{current.flag}</span>
 <span>{current.lang}</span>
 <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
 </button>
 {open && (
 <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-52 overflow-y-auto border border-border bg-popover shadow-lg">
 {countries.map((country) => (
 <button
 key={country.code}
 type="button"
 onClick={() => select(country)}
 className={cn(
 "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors hover:bg-muted",
 country.code === current.code ? "bg-muted" : "",
 )}
 >
 <span className="text-base leading-none">{country.flag}</span>
 <span className="flex-1">
 <span className={cn("block", country.code === current.code && "font-semibold text-foreground")}>
 {country.name}
 </span>
 <span className="block text-xs text-muted-foreground">{country.lang}</span>
 </span>
 </button>
 ))}
 </div>
 )}
 </div>
 );
}

const navLinks: { label: string; href: string }[] = [
 { label: "Jobs", href: "/jobs" },
 { label: "Talent", href: "/talent" },
 { label: "Resources", href: "/resources" },
 { label: "About us", href: "/about" },
];

function UserMenu() {
 const user = useAuthStore((s) => s.user);
 const logout = useLogout();
 const router = useRouter();
 const roles = ((user?.roles ?? []) as UserRole[]);
 const isAdmin =
 roles.includes(UserRole.ADMIN) || roles.includes(UserRole.SUPER_ADMIN);
 const isClient = user?.accountType === AccountType.CLIENT && !isAdmin;
 const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;
 const { data: talentProfile } = useTalentProfile(Boolean(user) && isTalent);
 const { data: clientProfile } = useClientProfile(isClient);

 const fullName = talentProfile
 ? [talentProfile.firstName, talentProfile.lastName]
 .filter(Boolean)
 .join(" ")
 : clientProfile
 ? [clientProfile.contactFirstName, clientProfile.contactLastName]
 .filter(Boolean)
 .join(" ")
 : "";
 const derivedName = user?.email.split("@")[0].replace(/[._-]/g, " ").trim() ?? "";
 const displayName = fullName || derivedName || user?.email || "";
 const initials = displayName.slice(0, 2).toUpperCase();
 const roleLabel =
 roles.length > 0
 ? roles
 .filter((role) => role !== UserRole.USER)
 .map((role) => ROLE_LABELS[role] ?? role)
 .join(", ")
 : user?.accountType ?? "";

 return (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <button
 type="button"
 className="flex items-center gap-2 border border-border p-0.5 pr-3 transition-colors"
 >
 <Avatar className="size-8">
 <AvatarFallback className="text-xs font-semibold">
 {initials}
 </AvatarFallback>
 </Avatar>
 <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
 {displayName}
 </span>
 <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56">
 <DropdownMenuLabel>
 <p className="truncate font-medium">{displayName}</p>
 <p className="truncate text-[11px] font-normal capitalize text-muted-foreground">
 {roleLabel}
 </p>
 <p className="truncate text-xs font-normal text-muted-foreground">
 {user?.email}
 </p>
 </DropdownMenuLabel>
 <DropdownMenuSeparator />
 <DropdownMenuItem
 onSelect={() => user && router.push(getDashboardRoute(user))}
 className="cursor-pointer"
 >
 <LayoutDashboard />
 {isTalent ? "Home" : "Dashboard"}
 </DropdownMenuItem>
 <DropdownMenuItem
 onSelect={() => router.push("/saved-jobs")}
 className="cursor-pointer"
 >
 <Bookmark />
 Saved jobs
 </DropdownMenuItem>
 <DropdownMenuItem
 onSelect={() => router.push("/settings")}
 className="cursor-pointer"
 >
 <Settings />
 Settings
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem
 onSelect={() => logout.mutate(undefined)}
 variant="destructive"
 className="cursor-pointer"
 >
 <LogOut />
 {logout.isPending ? "Signing out..." : "Sign out"}
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 );
}

export function Header() {
 const user = useAuthStore((s) => s.user);

 return (
 <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
 <div className="flex h-16 items-center justify-between px-5 sm:px-8">
 <div className="flex items-center gap-16">
 <Link
 href={user ? getDashboardRoute(user) : "/"}
 className="text-xl font-bold tracking-tight"
 >
 Worker
 </Link>
 <GlobalSearch className="h-10 w-80" />
 </div>
 <nav className="hidden items-center gap-1 md:flex">
 {navLinks.map((link) => (
 <Link
 key={link.label}
 href={link.href}
 className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
 >
 {link.label}
 </Link>
 ))}
 </nav>
 <div className="hidden items-center gap-4 md:flex">
 <CountrySelect />
 {user ? (
 <>
 <NotificationBell />
 <UserMenu />
 </>
 ) : (
 <>
 <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
 Sign in
 </Link>
 <Link
 href="/register"
 className="inline-flex h-9 items-center justify-center bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80"
 >
 Get started
 </Link>
 </>
 )}
 </div>
 <div className="flex items-center gap-3 md:hidden">
 <CountrySelect />
 {user ? (
 <>
 <NotificationBell />
 <UserMenu />
 </>
 ) : (
 <Link
 href="/register"
 className="inline-flex h-9 items-center justify-center bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80"
 >
 Get started
 </Link>
 )}
 </div>
 </div>
 </header>
 );
}
