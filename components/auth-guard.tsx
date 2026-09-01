"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getDashboardRoute } from "@/lib/utils";
import { AccountType, UserRole } from "@/types/api/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const { user, isAuthenticated, isLoading } = useAuth();

 useEffect(() => {
 if (isAuthenticated && user) {
 const redirect = new URLSearchParams(window.location.search).get("redirect");
 router.replace(
 redirect ||
 getDashboardRoute({
 accountType: user.accountType as AccountType,
 roles: user.roles as UserRole[],
 }),
 );
 }
 }, [isAuthenticated, user, router]);

 if (isLoading) {
 return null;
 }

 if (isAuthenticated) {
 return null;
 }

 return <>{children}</>;
}
