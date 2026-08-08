"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, Send, Trash2, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useAdminNotifications,
  useAdminNotificationStats,
  useDeleteNotification,
} from "@/lib/hooks/use-notifications";
import { NotificationSubNav } from "@/components/admin/notification-sub-nav";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Pagination } from "@/components/shared/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminNotificationItem } from "@/lib/types/api";

const CATEGORY_OPTIONS = [
  { value: "system", label: "System" },
  { value: "auth", label: "Auth" },
  { value: "job", label: "Job" },
  { value: "application", label: "Application" },
  { value: "offer", label: "Offer" },
  { value: "chat", label: "Chat" },
  { value: "follow", label: "Follow" },
] as const;

const STATUS_OPTIONS = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "failed", label: "Failed" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  sent: "bg-blue-500/10 text-blue-600",
  delivered: "bg-green-500/10 text-green-600",
  read: "bg-green-500/10 text-green-600",
  failed: "bg-destructive/10 text-destructive",
};

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () => (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
    [user]
  );

  const [search, setSearch] = useState("");
  const [listCategory, setListCategory] = useState("all");
  const [listStatus, setListStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data: stats } = useAdminNotificationStats();
  const { data, isLoading, isError, error } = useAdminNotifications({
    page,
    limit: 10,
    category: listCategory !== "all" ? listCategory : undefined,
    status: listStatus !== "all" ? listStatus : undefined,
    q: search || undefined,
  });
  const remove = useDeleteNotification();
  const [deleteTarget, setDeleteTarget] = useState<AdminNotificationItem | null>(null);

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 10));

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
          title="Notifications"
          description="Manage all notifications sent on the platform."
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total sent" value={stats?.total ?? 0} icon={Bell} />
          <StatCard label="Delivered" value={stats?.delivered ?? 0} icon={Send} />
          <StatCard label="Failed" value={stats?.failed ?? 0} icon={Trash2} />
          <StatCard label="Unread" value={stats?.unread ?? 0} icon={Users} />
        </div>

        <NotificationSubNav />

        <section className="space-y-4 rounded-xl border border-border/15 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">All notifications</h2>
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search title, message or email..."
              />
              <Select
                value={listStatus}
                onValueChange={(v) => {
                  setListStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={listCategory}
                onValueChange={(v) => {
                  setListCategory(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : isError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load notifications"}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="Sent notifications will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/15 text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Recipient</th>
                    <th className="pb-2 pr-3 font-medium">Title</th>
                    <th className="pb-2 pr-3 font-medium">Category</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 pr-3 font-medium">Date</th>
                    <th className="pb-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-3">
                        <p className="truncate font-medium">
                          {item.recipientEmail ?? item.userId}
                        </p>
                        {item.recipientAccountType && (
                          <p className="text-xs text-muted-foreground">
                            {item.recipientAccountType}
                          </p>
                        )}
                      </td>
                      <td className="max-w-48 py-2.5 pr-3">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.message}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 capitalize">{item.category}</td>
                      <td className="py-2.5 pr-3">
                        <StatusBadge status={item.status} styleMap={STATUS_STYLES} />
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete notification?"
        message={
          deleteTarget
            ? `Delete the notification "${deleteTarget.title}" for ${deleteTarget.recipientEmail ?? "this user"}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Notification deleted.");
              setDeleteTarget(null);
            },
            onError: (err) => {
              toast.error(err instanceof Error ? err.message : "Failed to delete");
            },
          });
        }}
      />
    </AnimatedContent>
  );
}
