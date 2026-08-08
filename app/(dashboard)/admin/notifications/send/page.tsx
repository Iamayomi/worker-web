"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { NotificationSubNav } from "@/components/admin/notification-sub-nav";
import { SendNotificationForm } from "@/components/admin/send-notification-form";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";

export default function AdminNotificationsSendPage() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () => (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
    [user]
  );

  if (!isAdmin) {
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
        <PageHeader
          title="Send notification"
          description="Send an announcement to one person or many."
        />
        <NotificationSubNav />
        <div className="max-w-2xl">
          <SendNotificationForm />
        </div>
      </div>
    </AnimatedContent>
  );
}
