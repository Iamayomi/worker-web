"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostJobPage } from "@/components/jobs/post-job-page";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType, UserRole } from "@/types/api/auth";

export default function NewJobPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isTalent) {
      router.replace("/dashboard/jobs/new");
    }
  }, [isLoading, isAuthenticated, isTalent, router]);

  if (!isLoading && isAuthenticated && !isTalent) {
    return null;
  }

  return <PostJobPage />;
}
