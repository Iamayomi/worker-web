"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PageForm } from "@/components/admin/page-form";
import { PageEditorSidebar } from "@/components/admin/page-editor-sidebar";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPagesNewPage() {
 const router = useRouter();
 const { user } = useAuth();
 const isAdmin = useMemo(
 () =>
 (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
 [user]
 );

 if (!isAdmin) {
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
 <div className="mx-auto max-w-5xl space-y-6">
 <div>
 <Link
 href="/admin/pages"
 className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
 >
 <ArrowLeft className="h-4 w-4" /> Back to landing pages
 </Link>
 <h1 className="mt-2 text-2xl font-bold tracking-tight">New page</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Create a landing page for public routes like talent, about or
 pricing.
 </p>
 </div>

 <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
 <PageForm onSaved={() => router.push("/admin/pages")} />
 <PageEditorSidebar />
 </div>
 </div>
 </AnimatedContent>
 );
}
