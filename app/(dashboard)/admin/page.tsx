"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminTotals } from "@/components/admin/admin-totals";
import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { UsersTable, type UsersExport } from "@/components/admin/users-table";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { AnimatedContent } from "@/components/shared/animated-content";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const isSuperAdmin = useMemo(
    () => (user?.roles ?? []).includes("super_admin"),
    [user]
  );
  const [exportData, setExportData] = useState<UsersExport | null>(null);

  const canManage = isSuperAdmin;

  if (!canManage && !(user?.roles ?? []).includes("admin")) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
            <h1 className="text-2xl font-bold tracking-tight">User management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage all registered users.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/invites">
                <UserPlus className="h-4 w-4" />
                Invite user
              </Link>
            </Button>
            {!canManage && (
              <Badge variant="secondary">
                <ShieldCheck className="h-3.5 w-3.5" /> View only
              </Badge>
            )}
            <ExportCsvButton
              filename={`users-${new Date().toISOString().slice(0, 10)}.csv`}
              headers={["Email", "Roles", "Status", "Verification", "Verified", "Joined"]}
              rows={exportData?.rows}
              fetchAll={exportData ? exportData.fetchAll : undefined}
            />
          </div>
        </div>

        <AdminSubNav active="users" />

        <AdminTotals />

        <UsersTable onExportReady={setExportData} />
      </div>
    </AnimatedContent>
  );
}
