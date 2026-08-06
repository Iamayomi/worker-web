"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const roles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    roles.includes(UserRole.SUPER_ADMIN) ||
    roles.includes(UserRole.ADMIN) ||
    user?.accountType === AccountType.ADMIN;

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin/analytics");
      return;
    }
    router.replace(
      user?.accountType === AccountType.CLIENT ? "/client-profile" : "/profile"
    );
  }, [router, user?.accountType, isAdmin]);

  return null;
}
