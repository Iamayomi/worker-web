"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType } from "@/types/api/auth";
import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { AccountTotals } from "@/components/admin/account-totals";
import { UsersTable, type UsersExport } from "@/components/admin/users-table";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { AnimatedContent } from "@/components/shared/animated-content";

export default function AdminClientsPage() {
 const { user } = useAuth();
 const isSuperAdmin = useMemo(
 () => (user?.roles ?? []).includes("super_admin"),
 [user]
 );
 const [exportData, setExportData] = useState<UsersExport | null>(null);

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
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">
 Client &amp; company accounts
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Companies and clients hiring on Worker.
 </p>
 </div>
 <ExportCsvButton
 filename={`clients-${new Date().toISOString().slice(0, 10)}.csv`}
 headers={["Email", "Roles", "Status", "Verification", "Verified", "Joined"]}
 rows={exportData?.rows}
 fetchAll={exportData ? exportData.fetchAll : undefined}
 />
 </div>

 <AdminSubNav active="clients" />

 <AccountTotals accountType={AccountType.CLIENT} />

 <UsersTable
 fixedAccountType={AccountType.CLIENT}
 onExportReady={setExportData}
 />
 </div>
 </AnimatedContent>
 );
}
