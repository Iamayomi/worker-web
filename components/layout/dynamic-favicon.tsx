"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type FaviconSpec = {
  letter: string;
  accent: string;
};

const DEFAULT_FAVICON: FaviconSpec = { letter: "W", accent: "#E4E4E7" };

function faviconForPath(pathname: string): FaviconSpec {
  const path = pathname.toLowerCase();
  if (path === "/" || path === "") return { letter: "W", accent: "#E4E4E7" };
  if (path.startsWith("/jobs") || path.startsWith("/applications"))
    return { letter: "J", accent: "#3B82F6" };
  if (path.startsWith("/interviews"))
    return { letter: "I", accent: "#10B981" };
  if (path.startsWith("/talent"))
    return { letter: "T", accent: "#8B5CF6" };
  if (path.startsWith("/home") || path.startsWith("/dashboard"))
    return { letter: "D", accent: "#06B6D4" };
  if (path.startsWith("/profile"))
    return { letter: "P", accent: "#14B8A6" };
  if (path.startsWith("/settings"))
    return { letter: "S", accent: "#6366F1" };
  if (path.startsWith("/saved-jobs"))
    return { letter: "B", accent: "#22C55E" };
  if (path.startsWith("/referral"))
    return { letter: "R", accent: "#F43F5E" };
  if (
    path.startsWith("/resources") ||
    path.startsWith("/blog") ||
    path.startsWith("/about") ||
    path.startsWith("/pricing") ||
    path.startsWith("/talent-market-report")
  )
    return { letter: "R", accent: "#EC4899" };
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/verify-email")
  )
    return { letter: "A", accent: "#EF4444" };
  return DEFAULT_FAVICON;
}

function buildSvg({ letter, accent }: FaviconSpec): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="16" fill="#0A0A0A"/>` +
    `<circle cx="48" cy="16" r="7" fill="${accent}"/>` +
    `<text x="32" y="40" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="middle">${letter}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function DynamicFavicon() {
  const pathname = usePathname();

  useEffect(() => {
    const href = buildSvg(faviconForPath(pathname ?? "/"));
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [pathname]);

  return null;
}
