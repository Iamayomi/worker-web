"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronDown, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { cn, getDashboardRoute } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/api/useAuth";
import { ROLE_LABELS } from "@/lib/constants/enums";
import { UserRole } from "@/types/api/auth";
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
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.lang}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-52 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
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

type NavColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type NavItem = {
  label: string;
  tagline: string;
  description: string;
  columns: NavColumn[];
  cta: { label: string; href: string };
};

const navItems: NavItem[] = [
  {
    label: "Jobs",
    tagline: "Find your next role",
    description: "Browse open roles at great companies worldwide, from remote to on-site.",
    columns: [
      {
        title: "By field",
        links: [
          { label: "Engineering", href: "/jobs" },
          { label: "Design", href: "/jobs" },
          { label: "Sales", href: "/jobs" },
          { label: "Marketing", href: "/jobs" },
          { label: "Finance", href: "/jobs" },
        ],
      },
      {
        title: "By type",
        links: [
          { label: "Full-time", href: "/jobs" },
          { label: "Contract", href: "/jobs" },
          { label: "Remote", href: "/jobs" },
        ],
      },
    ],
    cta: { label: "Post a job", href: "/register" },
  },
  {
    label: "Talent",
    tagline: "Hire or get hired",
    description:
      "Connect with verified professionals or create a profile that gets you matched.",
    columns: [
      {
        title: "For companies",
        links: [
          { label: "Search talent", href: "/talent" },
          { label: "Browse candidates", href: "/talent" },
          { label: "Recommended matches", href: "/talent" },
        ],
      },
      {
        title: "For talent",
        links: [
          { label: "Create profile", href: "/register/talent" },
          { label: "Get matched", href: "/talent" },
          { label: "Career advice", href: "/resources?category=Career+advice" },
        ],
      },
    ],
    cta: { label: "Explore talent", href: "/talent" },
  },
  {
    label: "Community",
    tagline: "Connect with peers",
    description: "Join a global network of professionals across every industry.",
    columns: [
      {
        title: "Connect",
        links: [
          { label: "Forums", href: "/community" },
          { label: "Events", href: "/community" },
          { label: "Mentorship", href: "/community" },
          { label: "Partnerships", href: "/community" },
        ],
      },
    ],
    cta: { label: "Join the community", href: "/community" },
  },
  {
    label: "Resources",
    tagline: "Guides and insights",
    description: "Everything you need to hire better or land your next opportunity.",
    columns: [
      {
        title: "Learn",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Job search guides", href: "/resources?category=Job+search+guide" },
          { label: "Hiring guides", href: "/resources?category=Hiring+guides" },
          { label: "Career advice", href: "/resources?category=Career+advice" },
        ],
      },
    ],
    cta: { label: "Browse resources", href: "/resources" },
  },
];

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";
  const roles = ((user?.roles ?? []) as UserRole[]).filter(
    (role) => role !== UserRole.USER
  );
  const roleLabel =
    roles.length > 0
      ? roles.map((role) => ROLE_LABELS[role] ?? role).join(", ")
      : user?.accountType ?? "";

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
          <p className="truncate capitalize">{roleLabel}</p>
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
          Dashboard
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
  const [active, setActive] = useState<string | null>(null);
  const item = navItems.find((i) => i.label === active) ?? null;
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            href={user ? getDashboardRoute(user) : "/"}
            className="text-xl font-bold tracking-tight"
          >
            Worker
          </Link>
          <GlobalSearch />
        </div>
        <nav className="hidden items-center md:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActive(active === item.label ? null : item.label)}
              onMouseEnter={() => setActive(item.label)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                active === item.label ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <CountrySelect />
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                Get started
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <CountrySelect />
          {user ? (
            <UserMenu />
          ) : (
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Get started
            </Link>
          )}
        </div>
      </div>

      {item && (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-border bg-background shadow-xl md:block"
          onMouseLeave={() => setActive(null)}
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-8 py-10 lg:grid-cols-[1.2fr_2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold">{item.tagline}</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              <Link
                href={item.cta.href}
                onClick={() => setActive(null)}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                {item.cta.label}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {item.columns.map((col) => (
                <div key={col.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          onClick={() => setActive(null)}
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
            <div className="hidden rounded-xl bg-muted p-6 lg:block">
              <p className="text-sm font-semibold">Trending now</p>
              <ul className="mt-4 space-y-3">
                {["Senior Frontend Engineer", "Marketing Manager", "Customer Support Specialist"].map((role) => (
                  <li key={role}>
                    <Link href="/jobs" onClick={() => setActive(null)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {role}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
