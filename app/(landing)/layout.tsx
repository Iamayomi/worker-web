"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";

export default function LandingLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const { isAuthenticated, isLoading, user } = useAuth();
 const router = useRouter();

 const roles = (user?.roles ?? []) as UserRole[];
 const isAdmin =
 roles.includes(UserRole.SUPER_ADMIN) || roles.includes(UserRole.ADMIN);
 const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

 useEffect(() => {
 if (!isLoading && isAuthenticated) {
 router.replace(isTalent ? "/home" : "/dashboard");
 }
 }, [isLoading, isAuthenticated, isTalent, router]);

 if (isLoading || isAuthenticated) return null;

 return <>{children}</>;
}
