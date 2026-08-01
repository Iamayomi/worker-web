"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute } from "@/lib/utils";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tokens = useAuthStore((s) => s.tokens);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (tokens && user) {
      router.replace(getDashboardRoute(user));
    }
  }, [tokens, user, router]);

  if (tokens) {
    return null;
  }

  return <>{children}</>;
}
