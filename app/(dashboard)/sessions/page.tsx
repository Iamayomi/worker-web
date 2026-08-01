"use client";

import { useSessions, useRevokeSession, useRevokeAllSessions } from "@/lib/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Globe, Trash2, LogOut } from "lucide-react";
import { AnimatedContent } from "@/components/shared/animated-content";

function getDeviceIcon(ua?: string) {
  if (!ua) return Globe;
  const l = ua.toLowerCase();
  if (l.includes("mobile") || l.includes("android") || l.includes("iphone")) return Smartphone;
  return Monitor;
}

function SessionRow({ s }: { s: any }) {
  const revoke = useRevokeSession(s.id);
  const DeviceIcon = getDeviceIcon(s.user_agent || s.device_info);

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
        s.is_current ? "border-primary/30 bg-primary/[0.02]" : "border-border/15"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-secondary p-2">
          <DeviceIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {s.device_info || "Unknown device"}
            {s.is_current && (
              <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">Current</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.ip_address && `${s.ip_address} · `}
            {s.last_active_at && `Last active ${new Date(s.last_active_at).toLocaleDateString()}`}
          </p>
        </div>
      </div>
      {!s.is_current && (
        <Button variant="ghost" size="icon-sm" onClick={() => revoke.mutate()} disabled={revoke.isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const revokeAll = useRevokeAllSessions();
  const list = (sessions as any[]) || [];

  if (isLoading) {
    return (
      <AnimatedContent>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent>
    <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Active sessions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your active login sessions
            </p>
          </div>
          {list.length > 1 && (
            <Button variant="destructive" onClick={() => revokeAll.mutate()} disabled={revokeAll.isPending}>
              <LogOut className="h-4 w-4" /> Revoke all
            </Button>
          )}
        </div>

      {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error.message}</div>
      )}

        <div className="space-y-2">
          {list.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No active sessions</p>
          )}
          {list.map((s: any) => (
              <SessionRow s={s} />
          ))}
        </div>
    </div>
    </AnimatedContent>
  );
}

