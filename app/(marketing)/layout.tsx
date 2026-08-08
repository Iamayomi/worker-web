"use client";

import { Header } from "@/components/layout/header";
import { TalentHeader } from "@/components/layout/talent-header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/auth/auth-context";
import { usePathname } from "next/navigation";
import { AccountType, UserRole } from "@/types/api/auth";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {isTalent ? <TalentHeader pathname={pathname} /> : <Header />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
