"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { SectionCard } from "@/components/shared/section-card";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContent } from "@/components/shared/animated-content";

export default function AdminInviteNewPage() {
 const { user } = useAuth();
 const isSuperAdmin = useMemo(
 () => (user?.roles ?? []).includes("super_admin"),
 [user]
 );

 if (!isSuperAdmin && !(user?.roles ?? []).includes("admin")) {
 return (
 <AnimatedContent>
 <div className="mx-auto max-w-2xl">
 <div className=" border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 You need an admin role to view this page.
 </div>
 </div>
 </AnimatedContent>
 );
 }

 return (
 <AnimatedContent>
 <div className="mx-auto max-w-6xl space-y-6">
 <PageHeader
 title="Invite a user"
 description="Send a platform invitation to a new user."
 backHref="/admin/invites"
 />

 <AdminSubNav active="invites" />

 <div className="max-w-xl">
 <SectionCard title="Invite details">
 <InviteUserForm />
 </SectionCard>
 </div>
 </div>
 </AnimatedContent>
 );
}
